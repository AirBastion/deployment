pragma solidity ^0.4.25;

/**
 *  @dev Base of the contract is Zeppelin-Solidity Superuser contract since we
 *       don't need to make transfers.
*/

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/access/rbac/RBAC.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";

/**
 * @title Superuser
 * @dev The Superuser contract defines a single superuser who can transfer the ownership
 *      of a contract to a new address, even if he is not the owner.
 *      A superuser can transfer his role to a new address.
 */

contract AIRCAccessibility is Ownable, RBAC, Pausable {

    /// @dev Emited when contract is upgraded
    event ContractUpgrade(address newContract);

    string public constant ROLE_SUPERUSER = "superuser";

    /// @dev array of 10 addresses which are used internally
    mapping (address => uint8) public _allowedEmployees;

    /// @dev The addresses of the accounts (or contracts) that can execute actions within each roles.
    address public ceoAddress;
    address public cfoAddress;
    address public cooAddress;
    address public owner = msg.sender;

    /// @dev Keeps track whether the contract is paused. When that is true, most actions are blocked
    bool public paused = false;

    /// @dev assigns the role to the address of deployment
    constructor() public {
        addRole(msg.sender, ROLE_SUPERUSER);
    }

    /**
    * @dev Throws if called by any account that's not a superuser.
    */
    modifier onlyAIRC() {
        checkRole(msg.sender, ROLE_SUPERUSER);
        _;
    }

    /// @dev Access modifier for CEO-only functionality
    modifier onlyCEO() {
        require(msg.sender == ceoAddress);
        _;
    }

    /// @dev Access modifier for CFO-only functionality
    modifier onlyCFO() {
        require(msg.sender == cfoAddress);
        _;
    }

    /// @dev Access modifier for COO-only functionality
    modifier onlyCOO() {
        require(msg.sender == cooAddress);
        _;
    }

    /// @dev Access modifier to execute functions based on being contract owner or having superuser role
    modifier onlyOwnerOrSuperuser() {
        require(msg.sender == owner || isSuperuser(msg.sender));
        _;
    }

    /// @dev Access modifier for Clevel functions
    modifier onlyCLevelOrOwner() {
        require(
            msg.sender == cooAddress ||
            msg.sender == ceoAddress ||
            msg.sender == cfoAddress ||
            msg.sender == owner
        );
        _;
    }

    // /// @dev can be run by any of our whitelisted addresses
    // /// @dev finish implementation
    // modifier onlyInternalAddresses() {
    //     require(
    //         _allowedEmployees[msg.sender] != false,
    //         "This address is not in our personel records."
    //     );
    //     _;
    // }

    // modifier onlyNotInternal() {
    //     require(
    //         _allowedEmployees[msg.sender] != true,
    //         "This address is in our personal records."
    //     );
    //     _;
    // }

    /// @dev Assigns a new address to act as the CEO. Only available to the current CEO.
    /// @param _newCEO The address of the new CEO
    function setCEO(address _newCEO) external onlyOwnerOrSuperuser {
        require(_newCEO != address(0));
        ceoAddress = _newCEO;
    }

    /// @dev Assigns a new address to act as the CFO. Only available to the current CEO.
    /// @param _newCFO The address of the new CFO
    function setCFO(address _newCFO) external onlyOwnerOrSuperuser {
        require(_newCFO != address(0));
        cfoAddress = _newCFO;
    }

    /// @dev Assigns a new address to act as the COO. Only available to the current CEO.
    /// @param _newCOO The address of the new COO
    function setCOO(address _newCOO) external onlyOwnerOrSuperuser {
        require(_newCOO != address(0));
        cooAddress = _newCOO;
    }

    // function setNewInternalAddress(address _newAddress) external onlyCLevelOrOwner {
    //     require(_newAddress != address(0));
    //     require(_allowedEmployees.length <= 10);
    //     _allowedEmployees.push(InternalAddress('', _newAddress));
    // }

    // function removeInternalAddress(address _addressToRemove) external onlyCLevelOrOwner {
    //     require(_allowedEmployees[_addressToRemove] != false);
    //     for (let i=0; i < 10; i++) {
    //         if (_allowedEmployees[i] == _addressToRemove){
    //             delete _allowedEmployees[i];
    //         }
    //     } 
    // }

    /**
    * @dev getter to determine if address has superuser role
    */
    function isSuperuser(address _addr)
        public
        view
        returns (bool)
    {
        return hasRole(_addr, ROLE_SUPERUSER);
    }

    /**
    * @dev Allows the current superuser to transfer his role to a newSuperuser.
    * @param _newSuperuser The address to transfer ownership to.
    */
    function transferSuperuser(address _newSuperuser) public onlyBAE {
        require(_newSuperuser != address(0));
        removeRole(msg.sender, ROLE_SUPERUSER);
        addRole(_newSuperuser, ROLE_SUPERUSER);
    }


    // Only the CEO, COO, and CFO can execute this function:
    function pause() public onlyCLevelOrOwner whenNotPaused {
        paused = true;
        Pause();
    }

    function unpause() public onlyCLevelOrOwner whenPaused {
        paused = false;
        Unpause();
    }
}
