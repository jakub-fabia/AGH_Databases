internal class Invoice
{
    public int InvoiceID { get; set; }
    public virtual ICollection<InvoiceDetail> InvoiceDetails { get; set; }
}