import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Cloud, CloudOff, Download, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { cloudSync, type SyncStatus } from "@/lib/cloudSync";
import { toast } from "sonner";

interface CloudSyncPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSync?: () => void;
}

export default function CloudSyncPanel({ isOpen, onClose, onSync }: CloudSyncPanelProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(cloudSync.getStatus());
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
      setSyncStatus(cloudSync.getStatus());
    };

    const interval = setInterval(checkStatus, 1000);
    checkStatus();

    return () => clearInterval(interval);
  }, []);

  const handleToggleSync = async (enabled: boolean) => {
    if (enabled) {
      const success = await cloudSync.enableCloudSync();
      if (success) {
        setIsEnabled(true);
        toast.success("Cloud sync enabled");
      } else {
        toast.error("Failed to enable cloud sync");
      }
    } else {
      cloudSync.disableCloudSync();
      setIsEnabled(false);
      toast.success("Cloud sync disabled");
    }
  };

  const handleManualBackup = async () => {
    const data = localStorage.getItem("memorylab_data");
    if (data) {
      const success = await cloudSync.manualBackup(JSON.parse(data));
      if (success) {
        toast.success("Backup created successfully");
      } else {
        toast.error("Backup failed");
      }
    } else {
      toast.error("No data to backup");
    }
  };

  const handleRestore = async () => {
    const restoredData = await cloudSync.restoreFromCloud();
    if (restoredData) {
      localStorage.setItem("memorylab_data", JSON.stringify(restoredData));
      toast.success("Data restored from backup");
      onSync?.();
      window.location.reload();
    } else {
      toast.error("No backup found or restore failed");
    }
  };

  const handleExportData = () => {
    const data = localStorage.getItem("memorylab_data");
    if (data) {
      const backup = {
        timestamp: new Date().toISOString(),
        version: "1.0",
        data: JSON.parse(data),
      };

      const element = document.createElement("a");
      element.setAttribute("href", `data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(backup, null, 2))}`);
      element.setAttribute("download", `memory-lab-backup-${new Date().toISOString().split("T")[0]}.json`);
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      toast.success("Data exported successfully");
    } else {
      toast.error("No data to export");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Cloud Sync Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sync Status */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Sync Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>Cloud Sync</span>
                <Switch checked={isEnabled} onCheckedChange={handleToggleSync} />
              </div>

              {syncStatus.isConnected ? (
                <div className="flex items-center gap-2 text-green-600 p-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Connected to Cloud</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-600 p-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Not Connected</span>
                </div>
              )}

              {syncStatus.lastSync && (
                <div className="text-xs text-muted-foreground p-2">
                  Last sync: {new Date(syncStatus.lastSync).toLocaleString()}
                </div>
              )}

              {syncStatus.error && (
                <div className="text-xs text-destructive p-2 bg-destructive/10 rounded">
                  {syncStatus.error}
                </div>
              )}
            </div>
          </div>

          {/* Backup Actions */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Backup & Restore</h3>
            <div className="space-y-2">
              <Button
                onClick={handleManualBackup}
                className="w-full"
                variant="outline"
                disabled={syncStatus.isSyncing}
              >
                <Upload className="w-4 h-4 mr-2" />
                Manual Backup
              </Button>

              <Button
                onClick={handleRestore}
                className="w-full"
                variant="outline"
                disabled={syncStatus.isSyncing}
              >
                <Download className="w-4 h-4 mr-2" />
                Restore from Backup
              </Button>

              <Button
                onClick={handleExportData}
                className="w-full"
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Export as JSON
              </Button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg text-sm text-blue-900 dark:text-blue-100">
            <p className="font-semibold mb-1">💡 How it works:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Enable Cloud Sync to auto-backup every 5 minutes</li>
              <li>Manual backups save immediately</li>
              <li>Export JSON for offline storage</li>
              <li>Restore anytime from backup</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
