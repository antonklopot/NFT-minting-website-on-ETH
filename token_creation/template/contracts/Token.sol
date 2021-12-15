//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ERC2981.sol";

contract {{contractName}} is ERC721Enumerable, ERC2981, Ownable{
  uint public constant MAX_UNITS = {{maxUnits}};
  string public constant DEFAULT_TOKEN_URI = "{{defaultUri}}";

  // Optional mapping for token URIs
  mapping (uint256 => string) private _tokenURIs;

  constructor() ERC721("{{contractName}}", "{{tickerSymbol}}")  {

  }

  modifier saleIsOpen{
    require(totalSupply() < MAX_UNITS, "Sale end");
    _;
  }

  function mintTokens(address _to, uint _count) public payable saleIsOpen {
    require(totalSupply() + _count <= MAX_PICKLES, "Max limit");
    require(totalSupply() < MAX_PICKLES, "Sale end");
    require(msg.value >= price(_count), "Value below price");
    for(uint i = 0; i < _count; i++){
      _safeMint(_to, totalSupply());
    }
  }

  function updateTokenURI(uint256 _tokenId, string memory _tokenURI) public {
    require(msg.sender == owner(), "Only owner can change the token URI");
    _setTokenURI(_tokenId, _tokenURI);
  }

  function price(uint _count) public view returns (uint256) {
    return {{weiPrice}} * _count;
  }

  /**
   * Supports ERC165, Rarible Secondary Sale Interface, and ERC721
   */
  function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Enumerable, ERC2981) returns (bool) {
    return super.supportsInterface(interfaceId);
  }

  /**
   * ERC2981 Royalties Standards (Mintable)
   */
  function royaltyInfo(uint256 _tokenId, uint256 _value, bytes calldata _data) external view override returns (address _receiver, uint256 _royaltyAmount, bytes memory _royaltyPaymentData) {
    return (owner(), _value / {{royaltyPercentage}}, _data);
  }

  /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    require(_exists(tokenId), "ERC721URIStorage: URI query for nonexistent token");

    string memory _tokenURI = _tokenURIs[tokenId];

    if (bytes(_tokenURI).length > 0) {
      return _tokenURI;
    }

    // just return default URI.
    string memory result = DEFAULT_TOKEN_URI;
    return result;
  }

  /**
   * @dev Sets `_tokenURI` as the tokenURI of `tokenId`.
   *
   * Requirements:
   *
   * - `tokenId` must exist.
   */
  function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
    require(_exists(tokenId), "ERC721URIStorage: URI set of nonexistent token");
    _tokenURIs[tokenId] = _tokenURI;
  }

  /**
   * @dev Destroys `tokenId`.
   * The approval is cleared when the token is burned.
   *
   * Requirements:
   *
   * - `tokenId` must exist.
   *
   * Emits a {Transfer} event.
   */
  function _burn(uint256 tokenId) internal virtual override {
    super._burn(tokenId);

    if (bytes(_tokenURIs[tokenId]).length != 0) {
      delete _tokenURIs[tokenId];
    }
  }

  function withdrawAll() public payable onlyOwner {
    require(payable(_msgSender()).send(address(this).balance));
  }
}
