using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IsBasvuru.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSubeAlanIdToPanelKullanici : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SubeAlanId",
                table: "PanelKullanicilari",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PanelKullanicilari_SubeAlanId",
                table: "PanelKullanicilari",
                column: "SubeAlanId");

            migrationBuilder.AddForeignKey(
                name: "FK_PanelKullanicilari_SubeAlanlar_SubeAlanId",
                table: "PanelKullanicilari",
                column: "SubeAlanId",
                principalTable: "SubeAlanlar",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PanelKullanicilari_SubeAlanlar_SubeAlanId",
                table: "PanelKullanicilari");

            migrationBuilder.DropIndex(
                name: "IX_PanelKullanicilari_SubeAlanId",
                table: "PanelKullanicilari");

            migrationBuilder.DropColumn(
                name: "SubeAlanId",
                table: "PanelKullanicilari");
        }
    }
}
