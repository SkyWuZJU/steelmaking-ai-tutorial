'use client'

import React from "react"
import { cn } from '@/lib/utils'
import { Button } from "./ui/button"
import { useSelectedItem } from '@/app/knowledge/selected-item-context';
import { KnowledgeFile } from "@/lib/types";

type KnowledgeItemProps = {
    file: KnowledgeFile;
};

const KnowledgeItem: React.FC<KnowledgeItemProps> = ({ file }) => {
    const { itemId, setItemId } = useSelectedItem();

    const isActive = itemId === file.id;

    return (
        <Button
            onClick={() => {
                setItemId(file.id);
                // refresh the page
                // window.location.reload();
            }}
            className={cn(
                'flex flex-col hover:bg-muted cursor-pointer p-2 rounded border',
                isActive ? 'bg-muted/70 border-border' : 'border-transparent'
            )}
        >
            {file.name}
        </Button>
    );
};

export default KnowledgeItem;