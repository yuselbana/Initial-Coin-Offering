//SPDX-License-Identifier:MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IMiku.sol";

contract MikuToken is ERC20, Ownable {
    IMiku MikuNFT; 
    uint256 public constant tokenPrice = 0.001 ether;
    uint256 public constant tokensPerNFT = 10*10**18;
    uint256 public constant maxTotalSupply = 10000*10**18;

    mapping(uint256 => bool) public tokenIdsClaimed;
    
    constructor(address _mikuAddress) ERC20("Miku Token", "MU"){
        MikuNFT = IMiku(_mikuAddress);
    }

function mint(uint256 amount) public payable {
    uint256 _requiredAmount = tokenPrice * amount;
    require(msg.value >= _requiredAmount,"Insufficient Funds.");
    uint256 amountWithDecimals = amount * 10**18;
    require((totalSupply() + amountWithDecimals)<=maxTotalSupply,"Max total supply reached.");
     _mint(msg.sender, amountWithDecimals);
}

function claim() public {
    address sender = msg.sender;
    uint256 balance = MikuNFT.balanceOf(sender);
    require (balance > 0,"Sorry, you do not own a MikuNFT!");
    uint amount = 0;
    for (uint256 i=0; i< balance; i++){
        uint256 tokenId = MikuNFT.tokenOfOwnerByIndex(sender, i);
        if(!tokenIdsClaimed[tokenId]) {
            amount += 1;
            tokenIdsClaimed[tokenId] = true;
        }
    }
    require(amount > 0,"You have already claimed your MikuTokens.");
    _mint(msg.sender,amount * tokensPerNFT);
}
    function withdraw() public onlyOwner{
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent, ) = _owner.call{value: amount}("");
        require(sent, "Failed to send ether");
    }
    receive() external payable{}
    fallback() external payable{}

}