using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IsBasvuru.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SirketYapisiVeTanimlamalar : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DepartmanId",
                table: "OyunBilgileri",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_OyunBilgileri_DepartmanId",
                table: "OyunBilgileri",
                column: "DepartmanId");

            migrationBuilder.AddForeignKey(
                name: "FK_OyunBilgileri_Departmanlar_DepartmanId",
                table: "OyunBilgileri",
                column: "DepartmanId",
                principalTable: "Departmanlar",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OyunBilgileri_Departmanlar_DepartmanId",
                table: "OyunBilgileri");

            migrationBuilder.DropIndex(
                name: "IX_OyunBilgileri_DepartmanId",
                table: "OyunBilgileri");

            migrationBuilder.DropColumn(
                name: "DepartmanId",
                table: "OyunBilgileri");
        }
    }
}
