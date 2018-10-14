pragma solidity ^0.4.25;

import "zeppelin-solidity/contracts/token/ERC20/PausableToken.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "./AIRCAccessibility.sol";

/// @title AIRC Token
/// @author Isaac
/// @notice
/// @return


contract AIRC is PausableToken, BAEAccessibility {
    using SafeMath for uint256;
    using SafeERC20 for ERC20;

    event Mint(address indexed to, uint256 amount);
    event MintFinished();
    event Burn(address indexed burner, uint256 value);


    string public name = "AIRCToken";
    string public symbol = "AIRC";
    uint public decimals = 6;
    uint public INITIAL_SUPPLY = 10000000000;  // 10b
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
    function userAmount() public view returns (uint) {
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