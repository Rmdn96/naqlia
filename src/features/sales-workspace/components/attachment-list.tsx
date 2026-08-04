import { FileText, Image, LockKeyhole } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Card } from "@/components/ui/card";
import type { SalesAttachment } from "@/features/sales-workspace/types/sales-workspace";

type AttachmentListProps = {
  attachments: SalesAttachment[];
};

function formatFileSize(size: number): string {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export async function AttachmentList({ attachments }: AttachmentListProps) {
  const t = await getTranslations("SalesWorkspace");

  return (
    <Card className="p-5" aria-labelledby="attachments-heading">
      <div className="flex items-center gap-2 text-primary">
        <LockKeyhole aria-hidden="true" className="size-5" />
        <h2 className="font-black" id="attachments-heading">
          {t("attachments")}
        </h2>
      </div>
      {attachments.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-muted-foreground">{t("noAttachments")}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {attachments.map((attachment) => {
            const Icon = attachment.mime_type === "application/pdf" ? FileText : Image;

            return (
              <li className="rounded-md border border-border p-3" key={attachment.id}>
                <div className="flex items-start gap-3">
                  <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{attachment.original_filename}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatFileSize(attachment.size_bytes)}
                    </p>
                    {attachment.signed_url ? (
                      <a
                        className="mt-3 inline-flex text-sm font-black text-primary hover:underline"
                        href={attachment.signed_url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {t("openAttachment", { name: attachment.original_filename })}
                      </a>
                    ) : (
                      <p className="mt-3 text-xs font-bold text-muted-foreground">
                        {t("attachmentUnavailable")}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
