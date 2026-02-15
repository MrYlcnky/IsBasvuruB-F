using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IsBasvuru.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Add_Program_And_Game_Management_Tables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // NOT: Veritabanından FK ve Index manuel silindiği için Drop komutları kaldırıldı.

            migrationBuilder.AddColumn<int>(
                name: "MasterProgramId",
                table: "ProgramBilgileri",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "ProgramAktifMi",
                table: "ProgramBilgileri",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "MasterOyunId",
                table: "OyunBilgileri",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "OyunAktifMi",
                table: "OyunBilgileri",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "MasterOyunlar",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    MasterOyunAdi = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MasterOyunlar", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "MasterProgramlar",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    MasterProgramAdi = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MasterProgramlar", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_ProgramBilgileri_MasterProgramId",
                table: "ProgramBilgileri",
                column: "MasterProgramId");

            migrationBuilder.CreateIndex(
                name: "IX_OyunBilgileri_MasterOyunId",
                table: "OyunBilgileri",
                column: "MasterOyunId");

            migrationBuilder.CreateIndex(
                name: "IX_IsBasvuruDetayPozisyonlari_IsBasvuruDetayId",
                table: "IsBasvuruDetayPozisyonlari",
                column: "IsBasvuruDetayId");

            // IsBasvuruDetayPozisyonlari ilişkisi (Restrict olarak yeniden tanımlanıyor)
            migrationBuilder.AddForeignKey(
                name: "FK_IsBasvuruDetayPozisyonlari_DepartmanPozisyonlar_DepartmanPoz~",
                table: "IsBasvuruDetayPozisyonlari",
                column: "DepartmanPozisyonId",
                principalTable: "DepartmanPozisyonlar",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OyunBilgileri_MasterOyunlar_MasterOyunId",
                table: "OyunBilgileri",
                column: "MasterOyunId",
                principalTable: "MasterOyunlar",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ProgramBilgileri_MasterProgramlar_MasterProgramId",
                table: "ProgramBilgileri",
                column: "MasterProgramId",
                principalTable: "MasterProgramlar",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_IsBasvuruDetayPozisyonlari_DepartmanPozisyonlar_DepartmanPoz~",
                table: "IsBasvuruDetayPozisyonlari");

            migrationBuilder.DropForeignKey(
                name: "FK_OyunBilgileri_MasterOyunlar_MasterOyunId",
                table: "OyunBilgileri");

            migrationBuilder.DropForeignKey(
                name: "FK_ProgramBilgileri_MasterProgramlar_MasterProgramId",
                table: "ProgramBilgileri");

            migrationBuilder.DropTable(
                name: "MasterOyunlar");

            migrationBuilder.DropTable(
                name: "MasterProgramlar");

            migrationBuilder.DropIndex(
                name: "IX_ProgramBilgileri_MasterProgramId",
                table: "ProgramBilgileri");

            migrationBuilder.DropIndex(
                name: "IX_OyunBilgileri_MasterOyunId",
                table: "OyunBilgileri");

            migrationBuilder.DropIndex(
                name: "IX_IsBasvuruDetayPozisyonlari_IsBasvuruDetayId",
                table: "IsBasvuruDetayPozisyonlari");

            migrationBuilder.DropColumn(
                name: "MasterProgramId",
                table: "ProgramBilgileri");

            migrationBuilder.DropColumn(
                name: "ProgramAktifMi",
                table: "ProgramBilgileri");

            migrationBuilder.DropColumn(
                name: "MasterOyunId",
                table: "OyunBilgileri");

            migrationBuilder.DropColumn(
                name: "OyunAktifMi",
                table: "OyunBilgileri");

            // Geri alırken (Down) eski haline (Cascade ve Unique Index) döndürüyoruz
            migrationBuilder.CreateIndex(
                name: "IX_IsBasvuruDetayPozisyonlari_IsBasvuruDetayId_DepartmanPozisyo~",
                table: "IsBasvuruDetayPozisyonlari",
                columns: new[] { "IsBasvuruDetayId", "DepartmanPozisyonId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_IsBasvuruDetayPozisyonlari_DepartmanPozisyonlar_DepartmanPoz~",
                table: "IsBasvuruDetayPozisyonlari",
                column: "DepartmanPozisyonId",
                principalTable: "DepartmanPozisyonlar",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}