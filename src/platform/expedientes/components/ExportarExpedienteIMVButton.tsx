import { Download } from 'lucide-react';
import { nowISO } from '@/shared/utils/dateUtils';
import { ExpedienteIndiceINMOVAL } from '../expedienteIndexTypes';
import {
  getExpedienteActivityINMOVAL,
  registrarActividadExpedienteINMOVAL,
} from '../expedienteActivityStorage';
import { downloadExpedienteIMV } from '../expedienteImvIO';

type ExportarExpedienteIMVButtonProps = {
  expediente: ExpedienteIndiceINMOVAL;
  disabled?: boolean;
};

export function ExportarExpedienteIMVButton({
  expediente,
  disabled,
}: ExportarExpedienteIMVButtonProps) {
  function handleExportar() {
    const actividad = getExpedienteActivityINMOVAL(expediente.id);

    downloadExpedienteIMV(expediente, actividad);

    registrarActividadExpedienteINMOVAL({
      expedienteId: expediente.id,
      tipo: 'archivo',
      titulo: 'Archivo .imv exportado',
      descripcion: `Se exportó el expediente ${expediente.codigo} como archivo .imv.`,
      creadoEn: nowISO(),
    });
  }

  return (
    <button
      type="button"
      onClick={handleExportar}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm font-medium text-sky-100 transition hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Download className="h-4 w-4" />
      Exportar .imv
    </button>
  );
}

export default ExportarExpedienteIMVButton;
