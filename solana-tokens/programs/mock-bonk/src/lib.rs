use anchor_lang::prelude::*;
use anchor_spl::token::{self, MintTo, Token, TokenAccount, Mint};

declare_id!("BonkMockABCDEF1234567890abcdef1234567890abcde");

#[program]
pub mod mock_bonk {
    use super::*;

    /// Initialize the Mock BONK token with massive supply (like real BONK)
    pub fn initialize_bonk(ctx: Context<InitializeBonk>) -> Result<()> {
        msg!("🚀 Initializing Mock BONK token with massive supply!");
        
        // Set up the mint with BONK-like properties
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        // Mint the massive initial supply (93 trillion BONK like real BONK)
        // 93,000,000,000,000 tokens with 5 decimals = 9.3e16 raw units
        let initial_supply: u64 = 93_000_000_000_000 * 10_u64.pow(5);
        token::mint_to(cpi_ctx, initial_supply)?;
        
        msg!("✅ Mock BONK initialized with {} tokens", initial_supply);
        Ok(())
    }

    /// Mint additional BONK tokens (for testing purposes)
    pub fn mint_bonk(ctx: Context<MintBonk>, amount: u64) -> Result<()> {
        msg!("🪙 Minting {} Mock BONK tokens", amount);
        
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.to.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        token::mint_to(cpi_ctx, amount)?;
        
        msg!("✅ Successfully minted {} Mock BONK tokens", amount);
        Ok(())
    }

    /// Get token info (for verification)
    pub fn get_bonk_info(ctx: Context<GetBonkInfo>) -> Result<()> {
        let mint = &ctx.accounts.mint;
        msg!("📊 Mock BONK Info:");
        msg!("  Supply: {}", mint.supply);
        msg!("  Decimals: {}", mint.decimals);
        msg!("  Mint Authority: {:?}", mint.mint_authority);
        msg!("  Freeze Authority: {:?}", mint.freeze_authority);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeBonk<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct MintBonk<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub to: Account<'info, TokenAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct GetBonkInfo<'info> {
    pub mint: Account<'info, Mint>,
}

#[error_code]
pub enum BonkError {
    #[msg("Insufficient authority")]
    InsufficientAuthority,
    #[msg("Invalid amount")]
    InvalidAmount,
}
