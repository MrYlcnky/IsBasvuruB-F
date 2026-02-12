using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace IsBasvuru.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Rolleri_Sabitle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Roller",
                columns: new[] { "Id", "RolAdi", "RolTanimi" },
                values: new object[,]
                {
                    { 1, "Süper Admin", "Tam yetkili, her şeyi gören ve müdahale eden yönetici." },
                    { 2, "Admin", "İK Müdürü, sistem tanımları ve kullanıcı atamaları yöneticisi." },
                    { 3, "İK Admin", "Başvuru yönetimi, log görüntüleme ve revize onay yetkilisi." },
                    { 4, "İK", "Başvuru yönetimi ve revize işlemleri (Kısıtlı yetki)." },
                    { 5, "Genel Müdür", "Üst düzey başvuru değerlendirme ve onay mercii." },
                    { 6, "Departman Müdürü", "İlgili departmana gelen başvuruları değerlendirme mercii." }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Roller",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Roller",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Roller",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Roller",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Roller",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Roller",
                keyColumn: "Id",
                keyValue: 6);
        }
    }
}
