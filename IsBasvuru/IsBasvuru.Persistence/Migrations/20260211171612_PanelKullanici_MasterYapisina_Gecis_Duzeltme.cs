using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IsBasvuru.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class PanelKullanici_MasterYapisina_Gecis_Duzeltme : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PanelKullanicilari_Departmanlar_DepartmanId",
                table: "PanelKullanicilari");

            migrationBuilder.DropForeignKey(
                name: "FK_PanelKullanicilari_SubeAlanlar_SubeAlanId",
                table: "PanelKullanicilari");

            migrationBuilder.RenameColumn(
                name: "SubeAlanId",
                table: "PanelKullanicilari",
                newName: "MasterDepartmanId");

            migrationBuilder.RenameColumn(
                name: "DepartmanId",
                table: "PanelKullanicilari",
                newName: "MasterAlanId");

            migrationBuilder.RenameIndex(
                name: "IX_PanelKullanicilari_SubeAlanId",
                table: "PanelKullanicilari",
                newName: "IX_PanelKullanicilari_MasterDepartmanId");

            migrationBuilder.RenameIndex(
                name: "IX_PanelKullanicilari_DepartmanId",
                table: "PanelKullanicilari",
                newName: "IX_PanelKullanicilari_MasterAlanId");

            migrationBuilder.AddForeignKey(
                name: "FK_PanelKullanicilari_MasterAlanlar_MasterAlanId",
                table: "PanelKullanicilari",
                column: "MasterAlanId",
                principalTable: "MasterAlanlar",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PanelKullanicilari_MasterDepartmanlar_MasterDepartmanId",
                table: "PanelKullanicilari",
                column: "MasterDepartmanId",
                principalTable: "MasterDepartmanlar",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PanelKullanicilari_MasterAlanlar_MasterAlanId",
                table: "PanelKullanicilari");

            migrationBuilder.DropForeignKey(
                name: "FK_PanelKullanicilari_MasterDepartmanlar_MasterDepartmanId",
                table: "PanelKullanicilari");

            migrationBuilder.RenameColumn(
                name: "MasterDepartmanId",
                table: "PanelKullanicilari",
                newName: "SubeAlanId");

            migrationBuilder.RenameColumn(
                name: "MasterAlanId",
                table: "PanelKullanicilari",
                newName: "DepartmanId");

            migrationBuilder.RenameIndex(
                name: "IX_PanelKullanicilari_MasterDepartmanId",
                table: "PanelKullanicilari",
                newName: "IX_PanelKullanicilari_SubeAlanId");

            migrationBuilder.RenameIndex(
                name: "IX_PanelKullanicilari_MasterAlanId",
                table: "PanelKullanicilari",
                newName: "IX_PanelKullanicilari_DepartmanId");

            migrationBuilder.AddForeignKey(
                name: "FK_PanelKullanicilari_Departmanlar_DepartmanId",
                table: "PanelKullanicilari",
                column: "DepartmanId",
                principalTable: "Departmanlar",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PanelKullanicilari_SubeAlanlar_SubeAlanId",
                table: "PanelKullanicilari",
                column: "SubeAlanId",
                principalTable: "SubeAlanlar",
                principalColumn: "Id");
        }
    }
}
