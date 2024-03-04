import React, { useEffect } from 'react';
import { BrowserBarcodeReader } from '@zxing/library';

const BarcodeScanner = ({ onDetected, variants }) => {
  useEffect(() => {
    const codeReader = new BrowserBarcodeReader();
    let selectedDeviceId = '';

    const scanBarcode = async () => {
      try {
        const videoInputDevices = await codeReader.listVideoInputDevices();
        if (videoInputDevices.length > 0) {
          selectedDeviceId = videoInputDevices[0].deviceId;
          await codeReader.decodeFromVideoDevice(selectedDeviceId, 'video', (result, err) => {
            if (result) {
              // Processing the barcode data
              const [serialNumber, modelNumber] = result.text.split(",");
              const matchingVariant = variants.find(variant => variant.modelNumber === modelNumber);
              if (matchingVariant) {
                // Constructing the object with the necessary details
                const scannedDetails = {
                  serialNumber,
                  modelNumber,
                  name: matchingVariant.name,
                  description: matchingVariant.description,
                  variantName: matchingVariant.variantName,
                  price: matchingVariant.price,
                  segmentName: matchingVariant.segmentName,
                  createdTime: new Date().toISOString(), // Present time
                };
                onDetected(scannedDetails);
              }
              codeReader.reset();
            }
            if (err && err.name !== 'NotFoundException') {
              console.error(err);
            }
          });
        }
      } catch (error) {
        console.error(error);
      }
    };

    scanBarcode();

    return () => {
      if (codeReader) {
        codeReader.reset();
      }
    };
  }, [onDetected, variants]);

  return <div><video id="video" style={{ width: '100%' }}></video></div>;
};

export default BarcodeScanner;
