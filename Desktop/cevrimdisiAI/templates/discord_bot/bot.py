#!/usr/bin/env python3
"""
{bot_name} - Discord Bot
ARIA tarafından oluşturuldu.

Kurulum:
  1. pip install -r requirements.txt
  2. .env.example dosyasını .env olarak kopyalayın
  3. .env içine bot token'ınızı ekleyin
  4. python bot.py ile çalıştırın
"""

import os
import logging
from datetime import datetime
import discord
from discord.ext import commands
from dotenv import load_dotenv

# ─── Yapılandırma ────────────────────────────────────────────

load_dotenv()
TOKEN = os.getenv('DISCORD_TOKEN')

if not TOKEN:
    raise ValueError("DISCORD_TOKEN bulunamadı! .env dosyasını kontrol edin.")

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)-8s | %(name)s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Bot intents
intents = discord.Intents.default()
intents.message_content = True
intents.members = True

# Bot instance
bot = commands.Bot(
    command_prefix='!',
    intents=intents,
    help_command=None  # Özel help komutu için
)

# ─── Events ──────────────────────────────────────────────────

@bot.event
async def on_ready():
    """Bot hazır olduğunda."""
    logger.info(f"Bot hazır: {bot.user} (ID: {bot.user.id})")
    logger.info(f"Sunucu sayısı: {len(bot.guilds)}")
    
    # Durum mesajı
    await bot.change_presence(
        activity=discord.Game(name="!yardım | {bot_name}")
    )


@bot.event
async def on_message(message):
    """Her mesajda tetiklenir."""
    # Bot kendi mesajlarını işleme
    if message.author == bot.user:
        return
    
    # Komutları işle
    await bot.process_commands(message)


@bot.event
async def on_command_error(ctx, error):
    """Komut hatası yakalandığında."""
    if isinstance(error, commands.CommandNotFound):
        await ctx.send("❌ Bilinmeyen komut. `!yardım` yazarak komutları görebilirsiniz.")
    elif isinstance(error, commands.MissingRequiredArgument):
        await ctx.send(f"❌ Eksik parametre: `{error.param.name}`")
    elif isinstance(error, commands.MissingPermissions):
        await ctx.send("❌ Bu komutu kullanmak için yetkiniz yok.")
    else:
        logger.error(f"Komut hatası: {error}", exc_info=True)
        await ctx.send(f"❌ Bir hata oluştu: {error}")


# ─── Komutlar ────────────────────────────────────────────────

@bot.command(name='ping')
async def ping(ctx):
    """Bot gecikmesini gösterir."""
    latency = round(bot.latency * 1000)
    await ctx.send(f"🏓 Pong! Gecikme: {latency}ms")


@bot.command(name='merhaba')
async def hello(ctx):
    """Selamlaşma komutu."""
    await ctx.send(f"👋 Merhaba {ctx.author.mention}! Ben {bot_name}.")


@bot.command(name='sunucu')
async def server_info(ctx):
    """Sunucu bilgilerini gösterir."""
    guild = ctx.guild
    embed = discord.Embed(
        title=f"📊 {guild.name}",
        color=discord.Color.blue(),
        timestamp=datetime.utcnow()
    )
    embed.add_field(name="Üye Sayısı", value=guild.member_count, inline=True)
    embed.add_field(name="Kanal Sayısı", value=len(guild.channels), inline=True)
    embed.add_field(name="Rol Sayısı", value=len(guild.roles), inline=True)
    embed.add_field(name="Oluşturulma", value=guild.created_at.strftime("%d/%m/%Y"), inline=True)
    
    if guild.icon:
        embed.set_thumbnail(url=guild.icon.url)
    
    await ctx.send(embed=embed)


@bot.command(name='kullanıcı')
async def user_info(ctx, member: discord.Member = None):
    """Kullanıcı bilgilerini gösterir."""
    member = member or ctx.author
    
    embed = discord.Embed(
        title=f"👤 {member.name}",
        color=member.color,
        timestamp=datetime.utcnow()
    )
    embed.add_field(name="ID", value=member.id, inline=True)
    embed.add_field(name="Takma Ad", value=member.display_name, inline=True)
    embed.add_field(name="Katılma Tarihi", value=member.joined_at.strftime("%d/%m/%Y"), inline=True)
    embed.add_field(name="Hesap Oluşturma", value=member.created_at.strftime("%d/%m/%Y"), inline=True)
    embed.add_field(name="Roller", value=len(member.roles) - 1, inline=True)
    
    embed.set_thumbnail(url=member.avatar.url if member.avatar else member.default_avatar.url)
    
    await ctx.send(embed=embed)


@bot.command(name='temizle')
@commands.has_permissions(manage_messages=True)
async def clear(ctx, amount: int = 10):
    """
    Mesajları temizler (Yönetici).
    
    Kullanım: !temizle [miktar]
    """
    if amount < 1 or amount > 100:
        await ctx.send("❌ 1-100 arası bir sayı belirtin.")
        return
    
    deleted = await ctx.channel.purge(limit=amount + 1)
    msg = await ctx.send(f"✅ {len(deleted) - 1} mesaj silindi.")
    await msg.delete(delay=3)


@bot.command(name='yardım')
async def help_command(ctx):
    """Yardım menüsünü gösterir."""
    embed = discord.Embed(
        title="📚 {bot_name} - Komutlar",
        description="Tüm komutlar `!` ile başlar.",
        color=discord.Color.purple()
    )
    
    embed.add_field(
        name="🔧 Genel",
        value=(
            "`!ping` - Bot gecikmesi\n"
            "`!merhaba` - Selamlaşma\n"
            "`!yardım` - Bu menü"
        ),
        inline=False
    )
    
    embed.add_field(
        name="📊 Bilgi",
        value=(
            "`!sunucu` - Sunucu bilgileri\n"
            "`!kullanıcı [@kullanıcı]` - Kullanıcı bilgileri"
        ),
        inline=False
    )
    
    embed.add_field(
        name="🛡️ Moderasyon",
        value=(
            "`!temizle [miktar]` - Mesaj temizle (Yönetici)"
        ),
        inline=False
    )
    
    embed.set_footer(text="ARIA tarafından oluşturuldu")
    
    await ctx.send(embed=embed)


# ─── Ana Çalıştırma ──────────────────────────────────────────

if __name__ == '__main__':
    logger.info("{bot_name} başlatılıyor...")
    try:
        bot.run(TOKEN)
    except Exception as e:
        logger.error(f"Bot başlatılamadı: {e}", exc_info=True)
