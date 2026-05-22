import { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { toPng } from 'html-to-image';

const IDCard = ({ user }) => {
  const exportRef = useRef();
  const [downloading, setDownloading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const logoDataUrl =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAkFBMVEUAIDMAHzIAGC0AFywAHDBWZnGRm6JodoAULj8AEing5Of////w8vOZpKxPYGxwf4kADCcMKDq6w8gaN0gAGy/3+Pnk6OrIzdGBkJkAASOqtLnR1tkdMUEsQVAySlkAFCoAAB1BVmQ6TFkAGS0AITdccn6Vn6V9ipMgPEw0Q1E2TVxBWmlVZG5te4QQMEPr7vCLmLabAAABP0lEQVR4AYWRBZKEQBAEGcMKd4dZ9/3/7244xSKucLK9takIZZRr2yKa0A2TbzPLsOG42ialng0lP9hgPIwwyo6TNbREiizKHRSUrDKWFWrPbERmt3SVsXXqLmD9IO2VK+l1xwvMtg0D320WkJt1Ffh5XeciLHb7OWQi86QNpfrgHfvF4E6RpgNpCojEIGQGzeqs5UClLteSFz5LeXV3N+V1V971JexmkO7OQQHY5SOD87Qu4TQuu4syAtyhGeOScAb74/WVIRVDeQKiRZ+JcfCBzJDyDLxlPy/W4xF+VQRTyNt2Z//BPCBT2GnnFHDeSuqZxrP5tWGlHGJ+ONDbGzhbk5Th61qPqTjnCRnNDnwCD8JBKtlnVypB1k3ihoEL5F87prJWQ+qnfUrD6OhXGE0ej91sDPu+T37XN77/qw8KkRoBAkcI+wAAAABJRU5ErkJggg==';

  // Generate QR code data
  const qrCodeData = user?.employeeId ? `${user.employeeId}|${user.email}` : 'No ID';

  const downloadDataUrl = (dataUrl, filename) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const downloadCard = async () => {
    setDownloading(true);
    setExporting(true);
    try {
      if (exportRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 60));
        const node = exportRef.current;
        const renderImage = (ignoreImages) =>
          toPng(node, {
            cacheBust: true,
            pixelRatio: 1,
            backgroundColor: '#ffffff',
            style: { opacity: '1' },
            width: node.scrollWidth,
            height: node.scrollHeight,
            filter: ignoreImages
              ? (element) => element.tagName !== 'IMG'
              : undefined,
          });

        let dataUrl;
        try {
          dataUrl = await renderImage(false);
        } catch (error) {
          console.warn('Retrying export without images.', error);
          dataUrl = await renderImage(true);
        }
        downloadDataUrl(dataUrl, `ID_Card_${user?.employeeId || 'Card'}.png`);
      }
    } catch (error) {
      console.error('Error downloading:', error);
    } finally {
      setDownloading(false);
      setExporting(false);
    }
  };

  const cardStyle = { aspectRatio: '85.6 / 53.98' };
  const exportDpi = 96;
  const exportCardWidth = Math.round(3.375 * exportDpi);
  const exportCardHeight = Math.round(2.125 * exportDpi);
  const exportCanvasWidth = exportCardWidth + 80;
  const exportCardStyle = {
    width: `${exportCardWidth}px`,
    height: `${exportCardHeight}px`,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your ID Card</h2>
        <button
          onClick={downloadCard}
          disabled={downloading}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          {downloading ? 'Downloading...' : 'Download Card'}
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Front Card */}
        <div
          className="relative overflow-hidden rounded-2xl border-2 border-slate-300 bg-white shadow-2xl"
          style={cardStyle}
        >
          {/* Blue Stripe on Left */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-b from-blue-800 to-blue-600"></div>

          <div className="ml-12 flex h-full flex-col p-4">
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <img
                src={logoDataUrl}
                alt="Apptunix"
                className="h-5 w-5"
              />
              <div className="text-xs font-bold tracking-wider text-slate-800">APPTUNIX</div>
            </div>

            {/* Main Content */}
            <div className="flex items-start justify-between pt-3">
              {/* Photo and Info */}
              <div className="flex flex-col gap-2">
                {/* Photo */}
                <div className="h-20 w-16 rounded border-2 border-slate-300 bg-slate-100 flex items-center justify-center text-2xl overflow-hidden flex-shrink-0">
                  {user?.enrollmentPhoto ? (
                    <img
                      src={user.enrollmentPhoto}
                      alt={user?.name}
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    '👤'
                  )}
                </div>

                {/* Name and Role */}
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-900">{user?.name}</div>
                  <div className="text-[10px] text-slate-600">{user?.department}</div>
                  <div className="text-[11px] font-bold text-blue-700 mt-1">{user?.employeeId}</div>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-1 mt-1">
                <div className="border border-slate-200 p-1 bg-white">
                  <QRCodeCanvas
                    value={qrCodeData}
                    size={72}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <div className="text-[8px] text-center text-slate-600 leading-tight">
                  Scan for
                  <br />
                  Verification
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-auto text-[8px] text-center text-slate-600 border-t border-slate-200 pt-1">
              www.apptunix.com
            </div>
          </div>
        </div>

        {/* Back Card */}
        <div
          className="relative overflow-hidden rounded-2xl border-2 border-slate-300 bg-white shadow-2xl"
          style={cardStyle}
        >
          {/* Blue Header Strip */}
          <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-4 py-2">
            <div className="flex items-center gap-2">
              <img
                src={logoDataUrl}
                alt="Apptunix"
                className="h-4 w-4"
              />
              <div className="text-xs font-bold tracking-wider text-white">APPTUNIX</div>
            </div>
          </div>

          <div className="p-3 flex h-full flex-col">
            {/* Main Content */}
            <div className="space-y-2">
              {/* Address */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                  Office Address
                </div>
                <div className="text-[10px] text-slate-600 leading-tight mt-0.5">
                  3rd Floor, C-127, Phase-8<br />
                  Industrial Area, Sector 73<br />
                  Sahibzada Ajit Singh Nagar<br />
                  Punjab 160071
                </div>
              </div>

              {/* Valid Until */}
              <div className="bg-blue-900 text-white px-2 py-1 rounded text-center">
                <div className="text-[8px]">Valid Until:</div>
                <div className="text-[11px] font-bold">
                  {new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-auto text-[9px] text-center text-slate-600 border-t border-slate-200 pt-1 pb-2 leading-tight">
              <div className="font-bold text-slate-800">This card is property of</div>
              <div className="font-bold text-slate-800">Apptunix.</div>
              <div className="text-[8px] mt-0.5">If found, return to HR Department.</div>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={exportRef}
        className={`fixed left-0 top-0 z-0 pointer-events-none ${
          exporting ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className="grid gap-4 bg-white p-4 justify-items-center"
          style={{ width: exportCanvasWidth }}
        >
          <div
            className="relative overflow-hidden rounded-2xl border-2 border-slate-300 bg-white shadow-2xl"
            style={exportCardStyle}
          >
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-b from-blue-800 to-blue-600"></div>

            <div className="ml-12 flex h-full flex-col p-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <img
                  src={logoDataUrl}
                  alt="Apptunix"
                  className="h-5 w-5"
                />
                <div className="text-xs font-bold tracking-wider text-slate-800">APPTUNIX</div>
              </div>

              <div className="flex items-start justify-between pt-3">
                <div className="flex flex-col gap-2">
                  <div className="h-20 w-16 rounded border-2 border-slate-300 bg-slate-100 flex items-center justify-center text-2xl overflow-hidden flex-shrink-0">
                    {user?.enrollmentPhoto ? (
                      <img
                        src={user.enrollmentPhoto}
                        alt={user?.name}
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      '👤'
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-900">{user?.name}</div>
                    <div className="text-[10px] text-slate-600">{user?.department}</div>
                    <div className="text-[11px] font-bold text-blue-700 mt-1">{user?.employeeId}</div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1 mt-1">
                  <div className="border border-slate-200 p-1 bg-white">
                    <QRCodeCanvas
                      value={qrCodeData}
                      size={72}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <div className="text-[8px] text-center text-slate-600 leading-tight">
                    Scan for
                    <br />
                    Verification
                  </div>
                </div>
              </div>

              <div className="mt-auto text-[8px] text-center text-slate-600 border-t border-slate-200 pt-1">
                www.apptunix.com
              </div>
            </div>
          </div>

          <div
            className="relative overflow-hidden rounded-2xl border-2 border-slate-300 bg-white shadow-2xl"
            style={exportCardStyle}
          >
            <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-4 py-2">
              <div className="flex items-center gap-2">
                <img
                  src={logoDataUrl}
                  alt="Apptunix"
                  className="h-4 w-4"
                />
                <div className="text-xs font-bold tracking-wider text-white">APPTUNIX</div>
              </div>
            </div>

            <div className="p-3 flex h-full flex-col">
              <div className="space-y-2">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Office Address
                  </div>
                  <div className="text-[10px] text-slate-600 leading-tight mt-0.5">
                    3rd Floor, C-127, Phase-8<br />
                    Industrial Area, Sector 73<br />
                    Sahibzada Ajit Singh Nagar<br />
                    Punjab 160071
                  </div>
                </div>

                <div className="bg-blue-900 text-white px-2 py-1 rounded text-center">
                  <div className="text-[8px]">Valid Until:</div>
                  <div className="text-[11px] font-bold">
                    {new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-auto text-[9px] text-center text-slate-600 border-t border-slate-200 pt-1 pb-2 leading-tight">
                <div className="font-bold text-slate-800">This card is property of</div>
                <div className="font-bold text-slate-800">Apptunix.</div>
                <div className="text-[8px] mt-0.5">If found, return to HR Department.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-4 py-3">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          💡 <strong>Your ID Card:</strong> Professional employee ID card with QR code verification. Click download to save as image.
        </p>
      </div>
    </div>
  );
};

export default IDCard;
