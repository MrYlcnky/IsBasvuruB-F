using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IsBasvuru.Domain.Enums
{
    public enum LogIslemTipi
    {
        Ekleme = 1,     // Insert
        Guncelleme = 2, // Update
        Silme = 3,      // Delete
        Hata = 4,
        Giris = 5,      // Login
        YeniBasvuru = 6, 
    }
}