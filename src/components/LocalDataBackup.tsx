import React, { useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Typography,
} from '@mui/material';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';

const BACKUP_VERSION = 1;
const STORAGE_KEYS = ['orders', 'platformOrders', 'trackingCouriers', 'savedPhones'] as const;

type BackupKey = (typeof STORAGE_KEYS)[number];

interface LocalBackup {
  version: number;
  createdAt: string;
  data: Partial<Record<BackupKey, unknown>>;
}

const LocalDataBackup: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingBackup, setPendingBackup] = useState<LocalBackup | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const downloadBackup = () => {
    const data: LocalBackup['data'] = {};

    STORAGE_KEYS.forEach((key) => {
      const value = localStorage.getItem(key);
      if (value !== null) {
        try {
          data[key] = JSON.parse(value);
        } catch {
          data[key] = value;
        }
      }
    });

    const backup: LocalBackup = {
      version: BACKUP_VERSION,
      createdAt: new Date().toISOString(),
      data,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `uslu-doner-yedek-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    setMessage('Yerel verileriniz yedeklendi.');
  };

  const openFilePicker = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as LocalBackup;
        if (
          !parsed ||
          typeof parsed !== 'object' ||
          typeof parsed.version !== 'number' ||
          !parsed.data ||
          typeof parsed.data !== 'object'
        ) {
          throw new Error('Geçersiz yedek');
        }
        setPendingBackup(parsed);
      } catch {
        setMessage('Bu dosya geçerli bir Uslu Döner yedeği değil.');
      }
    };
    reader.readAsText(file);
  };

  const restoreBackup = () => {
    if (!pendingBackup) return;

    STORAGE_KEYS.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(pendingBackup.data, key)) {
        localStorage.setItem(key, JSON.stringify(pendingBackup.data[key]));
      }
    });
    setPendingBackup(null);
    setMessage('Yedek geri yüklendi. Uygulama yenileniyor...');
    window.setTimeout(() => window.location.reload(), 700);
  };

  return (
    <>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
        <Button
          size="small"
          startIcon={<DownloadOutlinedIcon />}
          onClick={downloadBackup}
          aria-label="Yerel verileri yedekle"
        >
          Yedek Al
        </Button>
        <Button
          size="small"
          startIcon={<UploadFileOutlinedIcon />}
          onClick={openFilePicker}
          aria-label="Yerel veri yedeğini geri yükle"
        >
          Yedek Yükle
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={handleFileChange}
        />
      </Box>

      <Dialog open={Boolean(pendingBackup)} onClose={() => setPendingBackup(null)}>
        <DialogTitle>Yedeği geri yükle</DialogTitle>
        <DialogContent>
          <Typography>
            Mevcut sipariş, takip, kurye ve kayıtlı adres verileri bu yedekteki verilerle
            değiştirilecek. Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingBackup(null)} color="inherit">
            Vazgeç
          </Button>
          <Button onClick={restoreBackup} variant="contained" color="warning">
            Yedeği Geri Yükle
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(message)}
        autoHideDuration={3500}
        onClose={() => setMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={message?.startsWith('Bu dosya') ? 'error' : 'success'} variant="filled">
          {message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default LocalDataBackup;
