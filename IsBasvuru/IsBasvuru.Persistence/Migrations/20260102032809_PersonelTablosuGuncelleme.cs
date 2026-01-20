using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IsBasvuru.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class PersonelTablosuGuncelleme : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_KisiselBilgileri_Uyruklar_UyrukId",
                table: "KisiselBilgileri");

            migrationBuilder.AlterColumn<int>(
                name: "UyrukId",
                table: "KisiselBilgileri",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<string>(
                name: "UyrukAdi",
                table: "KisiselBilgileri",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddForeignKey(
                name: "FK_KisiselBilgileri_Uyruklar_UyrukId",
                table: "KisiselBilgileri",
                column: "UyrukId",
                principalTable: "Uyruklar",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_KisiselBilgileri_Uyruklar_UyrukId",
                table: "KisiselBilgileri");

            migrationBuilder.DropColumn(
                name: "UyrukAdi",
                table: "KisiselBilgileri");

            migrationBuilder.AlterColumn<int>(
                name: "UyrukId",
                table: "KisiselBilgileri",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_KisiselBilgileri_Uyruklar_UyrukId",
                table: "KisiselBilgileri",
                column: "UyrukId",
                principalTable: "Uyruklar",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
