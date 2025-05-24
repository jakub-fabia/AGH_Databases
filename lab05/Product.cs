internal class Product
{
    public int ProductID { get; set; }
    public String? ProductName { get; set; }
    public int UnitsInStock { get; set; }
    public virtual ICollection<InvoiceDetail> InvoiceDetails { get; set; }
    public override string ToString()
    {
        return $"{ProductID} {ProductName} {UnitsInStock}";
    }
}