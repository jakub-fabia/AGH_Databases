public class Supplier : Company
{
    public int SupplierID { get; set; }
    public string bankAccountNumber { get; set; }
    public override string ToString()
    {
        return $"{CompanyName} - {Street}, {City}, {Zip} (Bank Account: {bankAccountNumber})";
    }
}