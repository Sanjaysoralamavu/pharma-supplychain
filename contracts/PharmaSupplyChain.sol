// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PharmaSupplyChain
 * @notice Tracks pharmaceutical drug batches from manufacturer to consumer.
 *         Supports role-based access, custody transfers, IPFS cert storage, and recalls.
 */
contract PharmaSupplyChain {

    // ─── Roles ────────────────────────────────────────────────────────────────

    enum Role { None, Manufacturer, Distributor, Pharmacy, Regulator }

    mapping(address => Role) public roles;
    address public admin;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }
    modifier onlyRole(Role r) {
        require(roles[msg.sender] == r, "Unauthorized role");
        _;
    }
    modifier onlySupplyChain() {
        Role r = roles[msg.sender];
        require(
            r == Role.Manufacturer || r == Role.Distributor || r == Role.Pharmacy,
            "Not a supply chain actor"
        );
        _;
    }

    // ─── Data Structures ──────────────────────────────────────────────────────

    enum Status { Manufactured, InTransit, AtPharmacy, Dispensed, Recalled }

    struct CustodyEvent {
        address actor;
        Status  status;
        string  location;
        uint256 timestamp;
    }

    struct DrugBatch {
        string   batchId;
        string   drugName;
        string   ndcCode;
        address  currentOwner;
        Status   status;
        uint256  manufactureDate;
        uint256  expiryDate;
        string   ipfsCertCID;
        bool     exists;
        bool     recalled;
    }

    mapping(string => DrugBatch)      public batches;
    mapping(string => CustodyEvent[]) public custodyHistory;
    string[] public allBatchIds;

    // ─── Events ───────────────────────────────────────────────────────────────

    event BatchRegistered(string indexed batchId, string drugName, string ndcCode, address manufacturer, uint256 timestamp);
    event CustodyTransferred(string indexed batchId, address indexed from, address indexed to, string location, uint256 timestamp);
    event StatusUpdated(string indexed batchId, Status newStatus, uint256 timestamp);
    event BatchRecalled(string indexed batchId, string reason, address regulator, uint256 timestamp);
    event RoleAssigned(address indexed account, Role role);

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor() {
        admin = msg.sender;
        roles[msg.sender] = Role.Regulator;
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    function assignRole(address account, Role role) external onlyAdmin {
        roles[account] = role;
        emit RoleAssigned(account, role);
    }

    // ─── Manufacturer ─────────────────────────────────────────────────────────

    function registerBatch(
        string calldata batchId,
        string calldata drugName,
        string calldata ndcCode,
        uint256 expiryDate,
        string calldata ipfsCertCID
    ) external onlyRole(Role.Manufacturer) {
        require(!batches[batchId].exists, "Batch already registered");
        require(expiryDate > block.timestamp, "Expiry must be in the future");

        batches[batchId] = DrugBatch({
            batchId:         batchId,
            drugName:        drugName,
            ndcCode:         ndcCode,
            currentOwner:    msg.sender,
            status:          Status.Manufactured,
            manufactureDate: block.timestamp,
            expiryDate:      expiryDate,
            ipfsCertCID:     ipfsCertCID,
            exists:          true,
            recalled:        false
        });

        custodyHistory[batchId].push(CustodyEvent({
            actor:     msg.sender,
            status:    Status.Manufactured,
            location:  "Manufacturing facility",
            timestamp: block.timestamp
        }));

        allBatchIds.push(batchId);
        emit BatchRegistered(batchId, drugName, ndcCode, msg.sender, block.timestamp);
    }

    // ─── Transfer Custody ─────────────────────────────────────────────────────

    function transferCustody(
        string calldata batchId,
        address to,
        string calldata location
    ) external onlySupplyChain {
        DrugBatch storage batch = batches[batchId];
        require(batch.exists, "Batch not found");
        require(!batch.recalled, "Batch has been recalled");
        require(batch.currentOwner == msg.sender, "Not current owner");
        require(block.timestamp < batch.expiryDate, "Batch expired");

        Role toRole = roles[to];
        require(toRole != Role.None, "Recipient has no role");

        Status newStatus;
        if (toRole == Role.Distributor) newStatus = Status.InTransit;
        else if (toRole == Role.Pharmacy) newStatus = Status.AtPharmacy;
        else newStatus = batch.status;

        address previousOwner = batch.currentOwner;
        batch.currentOwner = to;
        batch.status = newStatus;

        custodyHistory[batchId].push(CustodyEvent({
            actor:     msg.sender,
            status:    newStatus,
            location:  location,
            timestamp: block.timestamp
        }));

        emit CustodyTransferred(batchId, previousOwner, to, location, block.timestamp);
        emit StatusUpdated(batchId, newStatus, block.timestamp);
    }

    // ─── Pharmacy ─────────────────────────────────────────────────────────────

    function markDispensed(string calldata batchId) external onlyRole(Role.Pharmacy) {
        DrugBatch storage batch = batches[batchId];
        require(batch.exists, "Batch not found");
        require(!batch.recalled, "Batch has been recalled");
        require(batch.currentOwner == msg.sender, "Not current owner");
        require(batch.status == Status.AtPharmacy, "Batch not at pharmacy");

        batch.status = Status.Dispensed;

        custodyHistory[batchId].push(CustodyEvent({
            actor:     msg.sender,
            status:    Status.Dispensed,
            location:  "Pharmacy",
            timestamp: block.timestamp
        }));

        emit StatusUpdated(batchId, Status.Dispensed, block.timestamp);
    }

    // ─── Regulator ────────────────────────────────────────────────────────────

    function recallBatch(
        string calldata batchId,
        string calldata reason
    ) external onlyRole(Role.Regulator) {
        DrugBatch storage batch = batches[batchId];
        require(batch.exists, "Batch not found");
        require(!batch.recalled, "Already recalled");

        batch.recalled = true;
        batch.status = Status.Recalled;

        custodyHistory[batchId].push(CustodyEvent({
            actor:     msg.sender,
            status:    Status.Recalled,
            location:  "Regulatory action",
            timestamp: block.timestamp
        }));

        emit BatchRecalled(batchId, reason, msg.sender, block.timestamp);
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    function getBatch(string calldata batchId) external view returns (DrugBatch memory) {
        require(batches[batchId].exists, "Batch not found");
        return batches[batchId];
    }

    function getCustodyHistory(string calldata batchId) external view returns (CustodyEvent[] memory) {
        require(batches[batchId].exists, "Batch not found");
        return custodyHistory[batchId];
    }

    function getAllBatchIds() external view returns (string[] memory) {
        return allBatchIds;
    }

    function verifyBatch(string calldata batchId)
        external view
        returns (bool isValid, bool isRecalled, bool isExpired)
    {
        DrugBatch storage batch = batches[batchId];
        require(batch.exists, "Batch not found");
        isRecalled = batch.recalled;
        isExpired  = block.timestamp >= batch.expiryDate;
        isValid    = !isRecalled && !isExpired;
    }
}
