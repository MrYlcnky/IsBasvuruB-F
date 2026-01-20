namespace IsBasvuru.Domain.DTOs.SirketYapisiDtos.DepartmanPozisyonDtos
{
    public class DepartmanPozisyonListDto
    {
        public int Id { get; set; }
        public required string DepartmanPozisyonAdi { get; set; }
        public bool DepartmanPozisyonAktifMi { get; set; }

        // Zincirleme Hiyerarşi Bilgileri
        public int DepartmanId { get; set; }
        public required string DepartmanAdi { get; set; }
        public required string SubeAlanAdi { get; set; }  
        public required string SubeAdi { get; set; }      
    }
}