use anchor_lang::prelude::*;
use anchor_spl::token::{self, MintTo, Token, TokenAccount, Mint};

declare_id!("USDCMockABCDEF1234567890abcdef1234567890abcde");

#[program]
pub mod mock_usdc {
    use super::*;

    /// Initialize the Mock USDC token with proper supply for testing
    pub fn initialize_usdc(ctx: Context<InitializeUsdc>) -> Result<()> {
        msg!("💵 Initializing Mock USDC token for testing!");
        
        // Set up the mint with USDC-like properties (6 decimals)
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        // Mint initial supply for testing (10 million USDC with 6 decimals)
        let initial_supply: u64 = 10_000_000 * 10_u64.pow(6);
        token::mint_to(cpi_ctx, initial_supply)?;
        
        msg!("✅ Mock USDC initialized with {} tokens", initial_supply);
        Ok(())
    }

    /// Mint additional USDC tokens (for testing purposes)
    pub fn mint_usdc(ctx: Context<MintUsdc>, amount: u64) -> Result<()> {
        msg!("🪙 Minting {} Mock USDC tokens", amount);
        
        // Validate amount is reasonable for USDC
        require!(amount <= 1_000_000 * 10_u64.pow(6), UsdcError::AmountTooLarge);
        
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.to.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        token::mint_to(cpi_ctx, amount)?;
        
        msg!("✅ Successfully minted {} Mock USDC tokens", amount);
        Ok(())
    }

    /// Batch mint USDC to multiple accounts (for airdrops)
    pub fn batch_mint_usdc(ctx: Context<BatchMintUsdc>, recipients: Vec<Pubkey>, amount: u64) -> Result<()> {
        msg!("🎁 Batch minting {} USDC to {} recipients", amount, recipients.len());
        
        // Limit batch size for performance
        require!(recipients.len() <= 50, UsdcError::BatchTooLarge);
        require!(amount <= 10_000 * 10_u64.pow(6), UsdcError::AmountTooLarge);
        
        // This would require additional account handling in real implementation
        // For now, just mint to the primary account
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.to.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        let total_amount = amount * recipients.len() as u64;
        token::mint_to(cpi_ctx, total_amount)?;
        
        msg!("✅ Batch mint completed: {} USDC distributed", total_amount);
        Ok(())
    }

    /// Get token info (for verification)
    pub fn get_usdc_info(ctx: Context<GetUsdcInfo>) -> Result<()> {
        let mint = &ctx.accounts.mint;
        msg!("📊 Mock USDC Info:");
        msg!("  Supply: {}", mint.supply);
        msg!("  Decimals: {}", mint.decimals);
        msg!("  Mint Authority: {:?}", mint.mint_authority);
        msg!("  Freeze Authority: {:?}", mint.freeze_authority);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeUsdc<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct MintUsdc<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub to: Account<'info, TokenAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct BatchMintUsdc<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub to: Account<'info, TokenAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct GetUsdcInfo<'info> {
    pub mint: Account<'info, Mint>,
}

#[error_code]
pub enum UsdcError {
    #[msg("Insufficient authority")]
    InsufficientAuthority,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Amount too large for single mint")]
    AmountTooLarge,
    #[msg("Batch size too large")]
    BatchTooLarge,
}
