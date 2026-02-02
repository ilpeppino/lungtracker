import { htmlToPdfBuffer } from '../../src/reporting/pdf';

describe('pdf', () => {
  describe('htmlToPdfBuffer', () => {
    it('should generate PDF buffer from HTML', async () => {
      const html = '<html><body><h1>Test Report</h1></body></html>';

      const result = await htmlToPdfBuffer(html);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle empty HTML', async () => {
      const html = '';

      const result = await htmlToPdfBuffer(html);

      expect(result).toBeInstanceOf(Buffer);
    });

    it('should handle complex HTML with styles', async () => {
      const html = `
        <html>
          <head><style>body { font-family: Arial; }</style></head>
          <body>
            <h1>Report Title</h1>
            <table>
              <tr><td>Data 1</td><td>Data 2</td></tr>
            </table>
          </body>
        </html>
      `;

      const result = await htmlToPdfBuffer(html);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });
  });
});