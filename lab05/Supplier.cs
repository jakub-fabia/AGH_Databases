using System.ComponentModel.DataAnnotations.Schema;

[Table("Suppliers")]
public class Supplier : Company
{
    public string bankAccountNumber { get; set; }
    public override string ToString()
    {
        return $"{CompanyName} - {Street}, {City}, {Zip} (Bank Account: {bankAccountNumber})";
    }
}