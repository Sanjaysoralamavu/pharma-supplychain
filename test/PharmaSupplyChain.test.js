const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("PharmaSupplyChain", function () {
  let contract;
  let admin, manufacturer, distributor, pharmacy, regulator, stranger;
  const Role = { None: 0, Manufacturer: 1, Distributor: 2, Pharmacy: 3, Regulator: 4 };
  const Status = { Manufactured: 0, InTransit: 1, AtPharmacy: 2, Dispensed: 3, Recalled: 4 };

  const BATCH_ID   = "BATCH-2024-001";
  const DRUG_NAME  = "Amoxicillin 500mg";
  const NDC_CODE   = "0069-0020-01";
  const IPFS_CID   = "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";
  const EXPIRY     = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365; // 1 year

  beforeEach(async () => {
    [admin, manufacturer, distributor, pharmacy, regulator, stranger] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("PharmaSupplyChain");
    contract = await Factory.deploy();
    await contract.waitForDeployment();

    // Assign roles
    await contract.assignRole(manufacturer.address, Role.Manufacturer);
    await contract.assignRole(distributor.address,  Role.Distributor);
    await contract.assignRole(pharmacy.address,     Role.Pharmacy);
    await contract.assignRole(regulator.address,    Role.Regulator);
  });

  // ── Role Management ──────────────────────────────────────────────────────

  describe("Role management", () => {
    it("should assign roles correctly", async () => {
      expect(await contract.roles(manufacturer.address)).to.equal(Role.Manufacturer);
      expect(await contract.roles(distributor.address)).to.equal(Role.Distributor);
      expect(await contract.roles(pharmacy.address)).to.equal(Role.Pharmacy);
    });

    it("should reject role assignment from non-admin", async () => {
      await expect(
        contract.connect(stranger).assignRole(stranger.address, Role.Manufacturer)
      ).to.be.revertedWith("Not admin");
    });
  });

  // ── Batch Registration ───────────────────────────────────────────────────

  describe("Batch registration", () => {
    it("should register a drug batch", async () => {
      await contract.connect(manufacturer).registerBatch(BATCH_ID, DRUG_NAME, NDC_CODE, EXPIRY, IPFS_CID);
      const batch = await contract.getBatch(BATCH_ID);
      expect(batch.drugName).to.equal(DRUG_NAME);
      expect(batch.ndcCode).to.equal(NDC_CODE);
      expect(batch.status).to.equal(Status.Manufactured);
      expect(batch.ipfsCertCID).to.equal(IPFS_CID);
      expect(batch.currentOwner).to.equal(manufacturer.address);
    });

    it("should emit BatchRegistered event", async () => {
      await expect(
        contract.connect(manufacturer).registerBatch(BATCH_ID, DRUG_NAME, NDC_CODE, EXPIRY, IPFS_CID)
      ).to.emit(contract, "BatchRegistered").withArgs(BATCH_ID, DRUG_NAME, NDC_CODE, manufacturer.address, anyValue);
    });

    it("should reject duplicate batch IDs", async () => {
      await contract.connect(manufacturer).registerBatch(BATCH_ID, DRUG_NAME, NDC_CODE, EXPIRY, IPFS_CID);
      await expect(
        contract.connect(manufacturer).registerBatch(BATCH_ID, DRUG_NAME, NDC_CODE, EXPIRY, IPFS_CID)
      ).to.be.revertedWith("Batch already registered");
    });

    it("should reject registration from non-manufacturer", async () => {
      await expect(
        contract.connect(stranger).registerBatch(BATCH_ID, DRUG_NAME, NDC_CODE, EXPIRY, IPFS_CID)
      ).to.be.revertedWith("Unauthorized role");
    });
  });

  // ── Custody Transfer ─────────────────────────────────────────────────────

  describe("Custody transfer", () => {
    beforeEach(async () => {
      await contract.connect(manufacturer).registerBatch(BATCH_ID, DRUG_NAME, NDC_CODE, EXPIRY, IPFS_CID);
    });

    it("should transfer from manufacturer to distributor", async () => {
      await contract.connect(manufacturer).transferCustody(BATCH_ID, distributor.address, "Warehouse A");
      const batch = await contract.getBatch(BATCH_ID);
      expect(batch.currentOwner).to.equal(distributor.address);
      expect(batch.status).to.equal(Status.InTransit);
    });

    it("should transfer from distributor to pharmacy", async () => {
      await contract.connect(manufacturer).transferCustody(BATCH_ID, distributor.address, "Warehouse A");
      await contract.connect(distributor).transferCustody(BATCH_ID, pharmacy.address, "City Pharmacy");
      const batch = await contract.getBatch(BATCH_ID);
      expect(batch.currentOwner).to.equal(pharmacy.address);
      expect(batch.status).to.equal(Status.AtPharmacy);
    });

    it("should record full custody history", async () => {
      await contract.connect(manufacturer).transferCustody(BATCH_ID, distributor.address, "Warehouse A");
      await contract.connect(distributor).transferCustody(BATCH_ID, pharmacy.address, "City Pharmacy");
      const history = await contract.getCustodyHistory(BATCH_ID);
      expect(history.length).to.equal(3); // register + 2 transfers
    });

    it("should reject transfer from non-owner", async () => {
      await expect(
        contract.connect(distributor).transferCustody(BATCH_ID, pharmacy.address, "Somewhere")
      ).to.be.revertedWith("Not current owner");
    });
  });

  // ── Dispensing ───────────────────────────────────────────────────────────

  describe("Dispensing", () => {
    beforeEach(async () => {
      await contract.connect(manufacturer).registerBatch(BATCH_ID, DRUG_NAME, NDC_CODE, EXPIRY, IPFS_CID);
      await contract.connect(manufacturer).transferCustody(BATCH_ID, distributor.address, "Warehouse A");
      await contract.connect(distributor).transferCustody(BATCH_ID, pharmacy.address, "City Pharmacy");
    });

    it("should allow pharmacy to mark batch as dispensed", async () => {
      await contract.connect(pharmacy).markDispensed(BATCH_ID);
      const batch = await contract.getBatch(BATCH_ID);
      expect(batch.status).to.equal(Status.Dispensed);
    });
  });

  // ── Recall ───────────────────────────────────────────────────────────────

  describe("Recall", () => {
    beforeEach(async () => {
      await contract.connect(manufacturer).registerBatch(BATCH_ID, DRUG_NAME, NDC_CODE, EXPIRY, IPFS_CID);
    });

    it("should allow regulator to recall a batch", async () => {
      await contract.connect(regulator).recallBatch(BATCH_ID, "Contamination detected");
      const batch = await contract.getBatch(BATCH_ID);
      expect(batch.recalled).to.be.true;
      expect(batch.status).to.equal(Status.Recalled);
    });

    it("should prevent transfer of recalled batch", async () => {
      await contract.connect(regulator).recallBatch(BATCH_ID, "Contamination");
      await expect(
        contract.connect(manufacturer).transferCustody(BATCH_ID, distributor.address, "Warehouse")
      ).to.be.revertedWith("Batch has been recalled");
    });

    it("should emit BatchRecalled event", async () => {
      await expect(
        contract.connect(regulator).recallBatch(BATCH_ID, "Contamination")
      ).to.emit(contract, "BatchRecalled");
    });
  });

  // ── Verification ─────────────────────────────────────────────────────────

  describe("Verification", () => {
    it("should return valid for a fresh batch", async () => {
      await contract.connect(manufacturer).registerBatch(BATCH_ID, DRUG_NAME, NDC_CODE, EXPIRY, IPFS_CID);
      const [isValid, isRecalled, isExpired] = await contract.verifyBatch(BATCH_ID);
      expect(isValid).to.be.true;
      expect(isRecalled).to.be.false;
      expect(isExpired).to.be.false;
    });

    it("should return invalid for recalled batch", async () => {
      await contract.connect(manufacturer).registerBatch(BATCH_ID, DRUG_NAME, NDC_CODE, EXPIRY, IPFS_CID);
      await contract.connect(regulator).recallBatch(BATCH_ID, "Contamination");
      const [isValid, isRecalled] = await contract.verifyBatch(BATCH_ID);
      expect(isValid).to.be.false;
      expect(isRecalled).to.be.true;
    });
  });
});