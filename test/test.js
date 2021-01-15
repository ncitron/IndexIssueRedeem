const { expect } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat")

const erc20abi = require("./erc20abi")

const dpiAddress = "0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b"

describe("IssueRedeem", function() {
  it("Should redeem DPI for ETH", async function() {

    //impersonate an account that holds DPI
    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: ["0xf6401adc23Faa6B9AD83eA8604CA7254CB7F53e7"]}
    )
    const signer = await ethers.provider.getSigner("0xf6401adc23Faa6B9AD83eA8604CA7254CB7F53e7")
    
    //get initial ETH and DPI balances
    const dpi = new ethers.Contract(dpiAddress, erc20abi, signer)
    const initDPIBalance = await dpi.balanceOf(signer._address)
    const initETHBalance = await signer.getBalance()

    //deploy IssueRedeem.sol
    const IssueRedeem = await ethers.getContractFactory("IssueRedeem")
    const issueRedeem = (await IssueRedeem.deploy()).connect(signer)

    //redeem dpi for ETH
    await dpi.approve(issueRedeem.address, ethers.utils.parseEther("10"))
    await issueRedeem.initApprovals(dpiAddress)
    await issueRedeem.redeem(dpiAddress, ethers.utils.parseEther("10"))

    //get final ETH and DPI balances
    const finalDPIBalance = await dpi.balanceOf(signer._address)
    const finalETHBalance = await signer.getBalance()
    
    //check if final DPI is less than init, and if final ETH is more than init
    expect(finalDPIBalance.lt(initDPIBalance)).to.equal(true)
    expect(finalETHBalance.gt(initETHBalance)).to.equal(true)
  });


  it("Should issue DPI with ETH", async function() {

    //impersonate an account that holds DPI
    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: ["0xf6401adc23Faa6B9AD83eA8604CA7254CB7F53e7"]}
    )
    const signer = await ethers.provider.getSigner("0xf6401adc23Faa6B9AD83eA8604CA7254CB7F53e7")
    
    //get initial ETH and DPI balances
    const dpi = new ethers.Contract(dpiAddress, erc20abi, signer)
    const initDPIBalance = await dpi.balanceOf(signer._address)
    const initETHBalance = await signer.getBalance()

    //deploy IssueRedeem.sol
    const IssueRedeem = await ethers.getContractFactory("IssueRedeem")
    const issueRedeem = (await IssueRedeem.deploy()).connect(signer)

    //issue 10 DPI using ETH
    await issueRedeem.initApprovals(dpiAddress)
    let overrides = {
        value: ethers.utils.parseEther("5")
    }
    await issueRedeem.issue(dpiAddress, ethers.utils.parseEther("10"), overrides)

    //get final ETH and DPI balances
    const finalDPIBalance = await dpi.balanceOf(signer._address)
    const finalETHBalance = await signer.getBalance()

    //check if final DPI is greater than init, and if final ETH is less than init (accounting for gas fees)
    expect(finalDPIBalance.gt(initDPIBalance)).to.equal(true)
    expect(finalETHBalance.add(ethers.utils.parseEther("0.2")).lt(initETHBalance)).to.equal(true)
  });
});
