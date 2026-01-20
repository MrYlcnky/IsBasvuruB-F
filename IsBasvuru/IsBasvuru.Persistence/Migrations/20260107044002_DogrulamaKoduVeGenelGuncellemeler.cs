using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IsBasvuru.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class DogrulamaKoduVeGenelGuncellemeler : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BasvuruIslemLoglari_PanelKullanicilari_PanelKullaniciId",
                table: "BasvuruIslemLoglari");

            migrationBuilder.AlterColumn<int>(
                name: "PanelKullaniciId",
                table: "BasvuruIslemLoglari",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.CreateTable(
                name: "DogrulamaKodlari",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Eposta = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Kod = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    GecerlilikTarihi = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    KullanildiMi = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DogrulamaKodlari", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddForeignKey(
                name: "FK_BasvuruIslemLoglari_PanelKullanicilari_PanelKullaniciId",
                table: "BasvuruIslemLoglari",
                column: "PanelKullaniciId",
                principalTable: "PanelKullanicilari",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BasvuruIslemLoglari_PanelKullanicilari_PanelKullaniciId",
                table: "BasvuruIslemLoglari");

            migrationBuilder.DropTable(
                name: "DogrulamaKodlari");

            migrationBuilder.AlterColumn<int>(
                name: "PanelKullaniciId",
                table: "BasvuruIslemLoglari",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_BasvuruIslemLoglari_PanelKullanicilari_PanelKullaniciId",
                table: "BasvuruIslemLoglari",
                column: "PanelKullaniciId",
                principalTable: "PanelKullanicilari",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
