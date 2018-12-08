pragma solidity ^0.4.24;

library SafeMath {

  /**
  * @dev Multiplies two numbers, throws on overflow.
  */
  function mul(uint256 _a, uint256 _b) internal pure returns (uint256 c) {
    // Gas optimization: this is cheaper than asserting 'a' not being zero, but the
    // benefit is lost if 'b' is also tested.
    // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
    if (_a == 0) {
      return 0;
    }

    c = _a * _b;
    assert(c / _a == _b);
    return c;
  }

  /**
  * @dev Integer division of two numbers, truncating the quotient.
  */
  function div(uint256 _a, uint256 _b) internal pure returns (uint256) {
    // assert(_b > 0); // Solidity automatically throws when dividing by 0
    // uint256 c = _a / _b;
    // assert(_a == _b * c + _a % _b); // There is no case in which this doesn't hold
    return _a / _b;
  }

  /**
  * @dev Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
  */
  function sub(uint256 _a, uint256 _b) internal pure returns (uint256) {
    assert(_b <= _a);
    return _a - _b;
  }

  /**
  * @dev Adds two numbers, throws on overflow.
  */
  function add(uint256 _a, uint256 _b) internal pure returns (uint256 c) {
    c = _a + _b;
    assert(c >= _a);
    return c;
  }
}

contract Ownable {
  address public owner;


  event OwnershipRenounced(address indexed previousOwner);
  event OwnershipTransferred(
    address indexed previousOwner,
    address indexed newOwner
  );


  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  constructor() public {
    owner = msg.sender;
  }

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  /**
   * @dev Allows the current owner to relinquish control of the contract.
   * @notice Renouncing to ownership will leave the contract without an owner.
   * It will not be possible to call the functions with the `onlyOwner`
   * modifier anymore.
   */
  function renounceOwnership() public onlyOwner {
    emit OwnershipRenounced(owner);
    owner = address(0);
  }

  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param _newOwner The address to transfer ownership to.
   */
  function transferOwnership(address _newOwner) public onlyOwner {
    _transferOwnership(_newOwner);
  }

  /**
   * @dev Transfers control of the contract to a newOwner.
   * @param _newOwner The address to transfer ownership to.
   */
  function _transferOwnership(address _newOwner) internal {
    require(_newOwner != address(0));
    emit OwnershipTransferred(owner, _newOwner);
    owner = _newOwner;
  }
}

contract Pausable is Ownable {
  event Pause();
  event Unpause();

  bool public paused = false;


  /**
   * @dev Modifier to make a function callable only when the contract is not paused.
   */
  modifier whenNotPaused() {
    require(!paused);
    _;
  }

  /**
   * @dev Modifier to make a function callable only when the contract is paused.
   */
  modifier whenPaused() {
    require(paused);
    _;
  }

  /**
   * @dev called by the owner to pause, triggers stopped state
   */
  function pause() public onlyOwner whenNotPaused {
    paused = true;
    emit Pause();
  }

  /**
   * @dev called by the owner to unpause, returns to normal state
   */
  function unpause() public onlyOwner whenPaused {
    paused = false;
    emit Unpause();
  }
}

library Roles {
  struct Role {
    mapping (address => bool) bearer;
  }

  /**
   * @dev give an address access to this role
   */
  function add(Role storage _role, address _addr)
    internal
  {
    _role.bearer[_addr] = true;
  }

  /**
   * @dev remove an address' access to this role
   */
  function remove(Role storage _role, address _addr)
    internal
  {
    _role.bearer[_addr] = false;
  }

  /**
   * @dev check if an address has this role
   * // reverts
   */
  function check(Role storage _role, address _addr)
    internal
    view
  {
    require(has(_role, _addr));
  }

  /**
   * @dev check if an address has this role
   * @return bool
   */
  function has(Role storage _role, address _addr)
    internal
    view
    returns (bool)
  {
    return _role.bearer[_addr];
  }
}

contract RBAC {
  using Roles for Roles.Role;

  mapping (string => Roles.Role) private roles;

  event RoleAdded(address indexed operator, string role);
  event RoleRemoved(address indexed operator, string role);

  /**
   * @dev reverts if addr does not have role
   * @param _operator address
   * @param _role the name of the role
   * // reverts
   */
  function checkRole(address _operator, string _role)
    public
    view
  {
    roles[_role].check(_operator);
  }

  /**
   * @dev determine if addr has role
   * @param _operator address
   * @param _role the name of the role
   * @return bool
   */
  function hasRole(address _operator, string _role)
    public
    view
    returns (bool)
  {
    return roles[_role].has(_operator);
  }

  /**
   * @dev add a role to an address
   * @param _operator address
   * @param _role the name of the role
   */
  function addRole(address _operator, string _role)
    internal
  {
    roles[_role].add(_operator);
    emit RoleAdded(_operator, _role);
  }

  /**
   * @dev remove a role from an address
   * @param _operator address
   * @param _role the name of the role
   */
  function removeRole(address _operator, string _role)
    internal
  {
    roles[_role].remove(_operator);
    emit RoleRemoved(_operator, _role);
  }

  /**
   * @dev modifier to scope access to a single role (uses msg.sender as addr)
   * @param _role the name of the role
   * // reverts
   */
  modifier onlyRole(string _role)
  {
    checkRole(msg.sender, _role);
    _;
  }

  /**
   * @dev modifier to scope access to a set of roles (uses msg.sender as addr)
   * @param _roles the names of the roles to scope access to
   * // reverts
   *
   * @TODO - when solidity supports dynamic arrays as arguments to modifiers, provide this
   *  see: https://github.com/ethereum/solidity/issues/2467
   */
  // modifier onlyRoles(string[] _roles) {
  //     bool hasAnyRole = false;
  //     for (uint8 i = 0; i < _roles.length; i++) {
  //         if (hasRole(msg.sender, _roles[i])) {
  //             hasAnyRole = true;
  //             break;
  //         }
  //     }

  //     require(hasAnyRole);

  //     _;
  // }
}

contract BAEAccessibility is Ownable, RBAC, Pausable {

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
    function BAEAccessibility() public {
        addRole(msg.sender, ROLE_SUPERUSER);
    }

    /**
    * @dev Throws if called by any account that's not a superuser.
    */
    modifier onlyBAE() {
        checkRole(msg.sender, ROLE_SUPERUSER);
        _;
    }

    /// @dev Access modifier for CEO-only functionality
    modifier onlyCEO() {
        require(
            msg.sender == ceoAddress,
            "Only our CEO address can execute this function");
        _;
    }

    /// @dev Access modifier for CFO-only functionality
    modifier onlyCFO() {
        require(
            msg.sender == cfoAddress,
            "Only our CFO can can ll this function");
        _;
    }

    /// @dev Access modifier for COO-only functionality
    modifier onlyCOO() {
        require(
            msg.sender == cooAddress,
            "Only our COO can can ll this function");
        _;
    }

    /// @dev Access modifier to execute functions based on being contract owner or having superuser role
    modifier onlyOwnerOrSuperuser() {
        require(
            msg.sender == owner || isSuperuser(msg.sender),
            "You need to be the owner or a superuser to call this function");
        _;
    }

    /// @dev Access modifier for Clevel functions
    modifier onlyCLevelOrOwner() {
        require(
            msg.sender == cooAddress ||
            msg.sender == ceoAddress ||
            msg.sender == cfoAddress ||
            msg.sender == owner,
            "You need to be the owner or a Clevel @BAE to call this function"
        );
        _;
    }

    modifier onlyNotBAE() {
        require(
            msg.sender != cooAddress &&
            msg.sender != ceoAddress &&
            msg.sender != cfoAddress &&
            msg.sender != owner,
            "You need to be the owner or a Clevel @BAE to call this function"
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
        emit Pause();
    }

    function unpause() public onlyCLevelOrOwner whenPaused {
        paused = false;
        emit Unpause();
    }
}

contract Destructible is BAEAccessibility {

    /**
    * @dev Transfers the current balance to the owner and terminates the contract
    *      onlyOwner needs to be changed to onlyBAE
    */
    function destroy() public onlyBAE {
        selfdestruct(owner);
    }

    /**
    * @dev Transfers the current balance to the address and terminates the contract.
    */
    function destroyAndSend(address _recipient) public onlyBAE {
        selfdestruct(_recipient);
    }
}


contract Pausable is Ownable {
    event Pause();
    event Unpause();
  
    bool public paused = false;
  
  
    /**
     * @dev Modifier to make a function callable only when the contract is not paused.
     */
    modifier whenNotPaused() {
      require(!paused);
      _;
    }
  
    /**
     * @dev Modifier to make a function callable only when the contract is paused.
     */
    modifier whenPaused() {
      require(paused);
      _;
    }
  
    /**
     * @dev called by the owner to pause, triggers stopped state
     */
    function pause() public onlyOwner whenNotPaused {
      paused = true;
      emit Pause();
    }
  
    /**
     * @dev called by the owner to unpause, returns to normal state
     */
    function unpause() public onlyOwner whenPaused {
      paused = false;
      emit Unpause();
    }
  }
  
  contract ERC20Basic {
    function totalSupply() public view returns (uint256);
    function balanceOf(address _who) public view returns (uint256);
    function transfer(address _to, uint256 _value) public returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
  }
  

  contract ERC20 is ERC20Basic {
    function allowance(address _owner, address _spender)
      public view returns (uint256);
  
    function transferFrom(address _from, address _to, uint256 _value)
      public returns (bool);
  
    function approve(address _spender, uint256 _value) public returns (bool);
    event Approval(
      address indexed owner,
      address indexed spender,
      uint256 value
    );
  }
  
  contract BasicToken is ERC20Basic {
    using SafeMath for uint256;
  
    mapping(address => uint256) internal balances;
  
    uint256 internal totalSupply_;
  
    /**
    * @dev Total number of tokens in existence
    */
    function totalSupply() public view returns (uint256) {
      return totalSupply_;
    }
  
    /**
    * @dev Transfer token for a specified address
    * @param _to The address to transfer to.
    * @param _value The amount to be transferred.
    */
    function transfer(address _to, uint256 _value) public returns (bool) {
      require(_value <= balances[msg.sender]);
      require(_to != address(0));
  
      balances[msg.sender] = balances[msg.sender].sub(_value);
      balances[_to] = balances[_to].add(_value);
      emit Transfer(msg.sender, _to, _value);
      return true;
    }
  
    /**
    * @dev Gets the balance of the specified address.
    * @param _owner The address to query the the balance of.
    * @return An uint256 representing the amount owned by the passed address.
    */
    function balanceOf(address _owner) public view returns (uint256) {
      return balances[_owner];
    }
  
  }
  
  contract StandardToken is ERC20, BasicToken {

    mapping (address => mapping (address => uint256)) internal allowed;
  
  
    /**
     * @dev Transfer tokens from one address to another
     * @param _from address The address which you want to send tokens from
     * @param _to address The address which you want to transfer to
     * @param _value uint256 the amount of tokens to be transferred
     */
    function transferFrom(
      address _from,
      address _to,
      uint256 _value
    )
      public
      returns (bool)
    {
      require(_value <= balances[_from]);
      require(_value <= allowed[_from][msg.sender]);
      require(_to != address(0));
  
      balances[_from] = balances[_from].sub(_value);
      balances[_to] = balances[_to].add(_value);
      allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
      emit Transfer(_from, _to, _value);
      return true;
    }
  
    /**
     * @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
     * Beware that changing an allowance with this method brings the risk that someone may use both the old
     * and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
     * race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     * @param _spender The address which will spend the funds.
     * @param _value The amount of tokens to be spent.
     */
    function approve(address _spender, uint256 _value) public returns (bool) {
      allowed[msg.sender][_spender] = _value;
      emit Approval(msg.sender, _spender, _value);
      return true;
    }
  
    /**
     * @dev Function to check the amount of tokens that an owner allowed to a spender.
     * @param _owner address The address which owns the funds.
     * @param _spender address The address which will spend the funds.
     * @return A uint256 specifying the amount of tokens still available for the spender.
     */
    function allowance(
      address _owner,
      address _spender
     )
      public
      view
      returns (uint256)
    {
      return allowed[_owner][_spender];
    }
  
    /**
     * @dev Increase the amount of tokens that an owner allowed to a spender.
     * approve should be called when allowed[_spender] == 0. To increment
     * allowed value is better to use this function to avoid 2 calls (and wait until
     * the first transaction is mined)
     * From MonolithDAO Token.sol
     * @param _spender The address which will spend the funds.
     * @param _addedValue The amount of tokens to increase the allowance by.
     */
    function increaseApproval(
      address _spender,
      uint256 _addedValue
    )
      public
      returns (bool)
    {
      allowed[msg.sender][_spender] = (
        allowed[msg.sender][_spender].add(_addedValue));
      emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
      return true;
    }
  
    /**
     * @dev Decrease the amount of tokens that an owner allowed to a spender.
     * approve should be called when allowed[_spender] == 0. To decrement
     * allowed value is better to use this function to avoid 2 calls (and wait until
     * the first transaction is mined)
     * From MonolithDAO Token.sol
     * @param _spender The address which will spend the funds.
     * @param _subtractedValue The amount of tokens to decrease the allowance by.
     */
    function decreaseApproval(
      address _spender,
      uint256 _subtractedValue
    )
      public
      returns (bool)
    {
      uint256 oldValue = allowed[msg.sender][_spender];
      if (_subtractedValue >= oldValue) {
        allowed[msg.sender][_spender] = 0;
      } else {
        allowed[msg.sender][_spender] = oldValue.sub(_subtractedValue);
      }
      emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
      return true;
    }
  
  }
  
  contract PausableToken is StandardToken, Pausable {

    function transfer(
      address _to,
      uint256 _value
    )
      public
      whenNotPaused
      returns (bool)
    {
      return super.transfer(_to, _value);
    }
  
    function transferFrom(
      address _from,
      address _to,
      uint256 _value
    )
      public
      whenNotPaused
      returns (bool)
    {
      return super.transferFrom(_from, _to, _value);
    }
  
    function approve(
      address _spender,
      uint256 _value
    )
      public
      whenNotPaused
      returns (bool)
    {
      return super.approve(_spender, _value);
    }
  
    function increaseApproval(
      address _spender,
      uint _addedValue
    )
      public
      whenNotPaused
      returns (bool success)
    {
      return super.increaseApproval(_spender, _addedValue);
    }
  
    function decreaseApproval(
      address _spender,
      uint _subtractedValue
    )
      public
      whenNotPaused
      returns (bool success)
    {
      return super.decreaseApproval(_spender, _subtractedValue);
    }
  }
  

contract AIRC is PausableToken, BAEAccessibility {
    using SafeMath for uint256;
    using SafeERC20 for ERC20;

    event Mint(address indexed to, uint256 amount);
    event MintFinished();
    event Burn(address indexed burner, uint256 value);


    string public name = "AIRCToken";
    string public symbol = "AiRC";
    uint public decimals = 6;
    uint public INITIAL_SUPPLY = 10542000000000000;  // 10b
    bool public mintingFinished = false;

    /// @dev total supply assigned to msg.sender - wanter to pass directly the crowdsale address
    constructor() public {
        totalSupply_ = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;
    }

    modifier validDestination(address _to)
    {
        require(_to != address(0x0));
        require(_to != address(this)); 
        _;
    }

    modifier canMint() {
        require(
            !mintingFinished,
            "Still minting."
        );
        _;
    }

    modifier hasMintPermission() {
        require(
            msg.sender == owner,
            "Message sender is not owner."
        );
        _;
    }

    /** 
     * @dev getter for name
     */
    function getName() public view returns (string) {
        return name;
    }

    /** 
     * @dev getter for token symbol
     */
    function getSymbol() public view returns (string) {
        return symbol;
    }

    /** 
     * @dev getter for totalSupply_
     */
    function getTotalSupply() public view returns (uint) {
        return totalSupply_;
    }

    /** 
     * @dev getter for user amount
     */
    function getAmount() public view returns (uint) {
        return balances[msg.sender];
    }

    /** 
     * @dev private 
     */
    function _burn(address _who, uint256 _value) internal onlyBAE {
        require(
            _value <= balances[_who],
            "Value is smaller than the value the account in balances has"
        );
        // no need to require value <= totalSupply, since that would imply the
        // sender's balance is greater than the totalSupply, which *should* be an assertion failure

        balances[_who] = balances[_who].sub(_value);
        totalSupply_ = totalSupply_.sub(_value);
        Burn(_who, _value);
        Transfer(_who, address(0), _value);
    }

    /**
    * @dev Function to mint tokens
    * @param _to The address that will receive the minted tokens.
    * @param _amount The amount of tokens to mint.
    * @return A boolean that indicates if the operation was successful.
    */
    function mint(
        address _to,
        uint256 _amount
    )
    public
    canMint
    onlyCLevelOrOwner
    returns (bool) {
        totalSupply_ = totalSupply_.add(_amount);
        balances[_to] = balances[_to].add(_amount);
        Mint(_to, _amount);
        Transfer(address(0), _to, _amount);
        return true;
    }

    /**
    * @dev Function to stop minting new tokens.
    * @return True if the operation was successful.
    */
    function finishMinting() 
    public 
    onlyCLevelOrOwner
    canMint 
    returns (bool) {
        mintingFinished = true;
        MintFinished();
        return true;
    }

}