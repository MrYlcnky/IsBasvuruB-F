using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IsBasvuru.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class MakeMasterBasvuruIdNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CvDegisiklikLoglari_MasterBasvurular_MasterBasvuruId",
                table: "CvDegisiklikLoglari");

            migrationBuilder.AlterColumn<int>(
                name: "MasterBasvuruId",
                table: "CvDegisiklikLoglari",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_CvDegisiklikLoglari_MasterBasvurular_MasterBasvuruId",
                table: "CvDegisiklikLoglari",
                column: "MasterBasvuruId",
                principalTable: "MasterBasvurular",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CvDegisiklikLoglari_MasterBasvurular_MasterBasvuruId",
                table: "CvDegisiklikLoglari");

            migrationBuilder.AlterColumn<int>(
                name: "MasterBasvuruId",
                table: "CvDegisiklikLoglari",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_CvDegisiklikLoglari_MasterBasvurular_MasterBasvuruId",
                table: "CvDegisiklikLoglari",
                column: "MasterBasvuruId",
                principalTable: "MasterBasvurular",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
