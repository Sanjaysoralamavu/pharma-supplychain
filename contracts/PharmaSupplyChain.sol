// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PharmaSupplyChain
 * @notice Tracks pharmaceutical drug batches from manufacturer to consumer.
 *         Supports role-based access, custody transfers, IPFS cert storage, and recalls.
 */
contract PharmaSupplyChain {

    // ─── Roles ────────────────────────────────────────────────────────────────

    /// @dev Defines all participant roles in the supply chain
    enum Role { None, Manufacturer, Distributor, Pharmacy, Regulator }

    /// @dev Stores role assigned to each address
    mapping(address => Role) public roles;

    /// @dev Admin address (contract deployer)
    address public admin;

    /// @dev Restricts access to admin only
    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    /// @dev Restricts access to a specific role
    modifier onlyRole(Role r) {
        require(roles[msg.sender] == r, "Unauthorized role");
        _;
    }

    /// @dev Restricts access to supply chain actors (manufacturer, distributor, pharmacy)
    modifier onlySupplyChain() {
        Role r = roles[msg.sender];
        require(
            r == Role.Manufacturer || r == Role.Distributor || r == Role.Pharmacy,
            "Not a supply chain actor"
        );
        _;
    }

    // ─── Data Structures ──────────────────────────────────────────────────────

    /// @dev Represents lifecycle status of a drug batch
    enum Status { Manufactured, InTransit, AtPharmacy, Dispensed, Recalled }

    /// @dev Represents one step/event in the supply chain history
    struct CustodyEvent {
        address actor;
        Status  status;
        string  location;
        uint256 timestamp;
    }

    /// @dev Stores all data related to a pharmaceutical batch
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

    /// @dev Maps batch ID to batch data
    mapping(string => DrugBatch)      public batches;

    /// @dev Maps batch ID to full custody history
    mapping(string => CustodyEvent[]) public custodyHistory;

    /// @dev Stores all registered batch IDs
    string[] public allBatchIds;

    // ─── Events ───────────────────────────────────────────────────────────────

    /// @dev Emitted when a batch is registered
    event BatchRegistered(string indexed batchId, string drugName, string ndcCode, address manufacturer, uint256 timestamp);

    /// @dev Emitted when custody is transferred
    event CustodyTransferred(string indexed batchId, address indexed from, address indexed to, string location, uint256 timestamp);

    /// @dev Emitted when status changes
    event StatusUpdated(string indexed batchId, Status newStatus, uint256 timestamp);

    /// @dev Emitted when a batch is recalled
    event BatchRecalled(string indexed batchId, string reason, address regulator, uint256 timestamp);

    /// @dev Emitted when a role is assigned
    event RoleAssigned(address indexed account, Role role);

    // ─── Constructor ──────────────────────────────────────────────────────────

    /// @dev Initializes contract and assigns deployer as regulator
    constructor() {
        admin = msg.sender;
        roles[msg.sender] = Role.Regulator;
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    /// @dev Assigns a role to an address (only admin)
    function assignRole(address account, Role role) external onlyAdmin {
        roles[account] = role;
        emit RoleAssigned(account, role);
    }

    // ─── Manufacturer ─────────────────────────────────────────────────────────

    /// @dev Registers a new drug batch and creates first history record
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

    /// @dev Transfers ownership/custody of a batch and records history
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

    /// @dev Marks batch as dispensed when it reaches pharmacy
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

    /// @dev Allows regulator to recall a batch and update status/history
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

    /// @dev Returns batch details
    function getBatch(string calldata batchId) external view returns (DrugBatch memory) {
        require(batches[batchId].exists, "Batch not found");
        return batches[batchId];
    }

    /// @dev Returns full custody history
    function getCustodyHistory(string calldata batchId) external view returns (CustodyEvent[] memory) {
        require(batches[batchId].exists, "Batch not found");
        return custodyHistory[batchId];
    }

    /// @dev Returns all batch IDs
    function getAllBatchIds() external view returns (string[] memory) {
        return allBatchIds;
    }

    /// @dev Verifies batch validity (not recalled and not expired)
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