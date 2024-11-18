'use client'

import KnowledgeList from '@/components/knowledge-list'
import KnowledgeUploadForm from "@/components/knowledge-upload-form"
import KnowledgeDetailPlaceholder from "@/components/knowledge-detail-placeholder"
import KnowledgeDetail from '@/components/knowledge-detail';
import { SelectedItemProvider, useSelectedItem } from './selected-item-context';

export default function Page() {
  return (
    <SelectedItemProvider>
      <div className="flex justify-center items-center p-16 w-screen h-screen">
        <div className="flex flex-row w-full h-full max-w-6xl gap-1">
          <div className="flex flex-col gap-1 w-1/3 h-full">
            <div className="flex-1 min-h-80 overflow-y-auto">
              <KnowledgeList />
            </div>
            <KnowledgeUploadForm className="mt-auto"/>
          </div>
          <div className="w-2/3 h-full justify-center items-center">
            <DetailSection />
          </div>
        </div>
      </div>
    </SelectedItemProvider>
  )
}

function DetailSection() {
  const { itemId } = useSelectedItem();

  return itemId ? (
    <KnowledgeDetail fileId={itemId} />
  ) : (
    <KnowledgeDetailPlaceholder />
  );
}