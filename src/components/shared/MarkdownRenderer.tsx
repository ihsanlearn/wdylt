import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { AlertCircle, Info, CheckCircle2, AlertTriangle, XCircle, Lightbulb } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn(
        "prose prose-sm dark:prose-invert max-w-none wrap-break-word text-foreground",
        "prose-headings:text-foreground prose-p:text-foreground",
        "prose-strong:text-foreground prose-strong:font-bold",
        "prose-li:text-foreground prose-blockquote:text-foreground prose-blockquote:border-l-primary",
        "prose-a:text-primary prose-code:text-foreground prose-code:bg-muted prose-code:rounded-sm prose-code:px-1",
        "prose-pre:bg-muted prose-pre:text-foreground prose-ol:text-foreground prose-ul:text-foreground prose-hr:border-border",
        "prose-table:border-collapse prose-th:border prose-th:border-border prose-th:p-2 prose-td:border prose-td:border-border prose-td:p-2",
        className
    )}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          blockquote: ({ node, children, ...props }) => {
            // ReactMarkdown passes the children properly. 
            // We need to check if the content of the blockquote starts with an alert tag.
            // However, 'children' is usually an array of elements (like paragraphs).
            
            // This is a simplified approach to find the type. 
            // A more robust parser would be ideal but for simple use cases:
            // Improved detection logic to handle various parsing structures
            const childrenArray = React.Children.toArray(children);
            const firstChild = childrenArray[0];
            let alertType: "note" | "tip" | "important" | "warning" | "caution" | null = null;
            let alertContent = children;

            // Helper to get text from a node
            const getFirstLineText = (node: React.ReactNode): string | null => {
               if (typeof node === 'string') return node;
               if (React.isValidElement(node) && node.props && typeof node.props === 'object' && 'children' in node.props) {
                   const nodeChildren = React.Children.toArray((node.props as any).children);
                   if (nodeChildren.length > 0) return getFirstLineText(nodeChildren[0]);
               }
               return null;
            };

            // Check if first child likely contains the tag
            if (firstChild) {
                const text = getFirstLineText(firstChild);
                if (text) {
                     const match = text.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
                     if (match) {
                         alertType = match[1].toLowerCase() as any;
                     }
                }
            }

            if (alertType) {
                 // We need to strip the tag from the content.
                 // This is tricky because the tag might be inside a paragraph (p) which is the first child.
                 // We'll process the first child to remove the tag string.
                 
                 const processNodeToRemoveTag = (node: React.ReactNode): React.ReactNode => {
                      if (typeof node === 'string') {
                          return node.replace(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i, "").trim();
                      }
                      if (React.isValidElement(node)) {
                          const props = node.props as any;
                          const nodeChildren = React.Children.toArray(props.children);
                          if (nodeChildren.length > 0) {
                              const first = nodeChildren[0];
                              const processedFirst = processNodeToRemoveTag(first);
                              // Reassemble
                              const newChildren = [processedFirst, ...nodeChildren.slice(1)];
                              return React.cloneElement(node, { children: newChildren } as any);
                          }
                      }
                      return node;
                 };

                 const processedFirstChild = processNodeToRemoveTag(firstChild);
                 // If the resulting first child is empty (e.g. just a <p></p> or empty text), we might want to filter it if it's just whitespace?
                 // But for now keeping it is safer layout-wise.
                 
                 alertContent = [processedFirstChild, ...childrenArray.slice(1)];
            }

            if (!alertType) {
              return <blockquote {...props}>{children}</blockquote>;
            }

            const styles: Record<string, string> = {
              note: "bg-blue-50/50 dark:bg-blue-950/20 border-blue-500 text-blue-700 dark:text-blue-400",
              tip: "bg-green-50/50 dark:bg-green-950/20 border-green-500 text-green-700 dark:text-green-400",
              important: "bg-purple-50/50 dark:bg-purple-950/20 border-purple-500 text-purple-700 dark:text-purple-400",
              warning: "bg-orange-50/50 dark:bg-orange-950/20 border-orange-500 text-orange-700 dark:text-orange-400",
              caution: "bg-red-50/50 dark:bg-red-950/20 border-red-500 text-red-700 dark:text-red-400",
            };

            const icons: Record<string, React.ReactNode> = {
              note: <Info className="h-4 w-4" />,
              tip: <Lightbulb className="h-4 w-4" />,
              important: <AlertCircle className="h-4 w-4" />,
              warning: <AlertTriangle className="h-4 w-4" />,
              caution: <XCircle className="h-4 w-4" />,
            };

            const titles: Record<string, string> = {
                note: "Note",
                tip: "Tip",
                important: "Important",
                warning: "Warning",
                caution: "Caution"
            }

            // If the text after tag is empty, maybe don't show it in the body and just treat as block wrapper?
            // GitHub renders:
            // > [!NOTE]
            // > content...
            // distinct from
            // > [!NOTE] content...
            
            // Our logic handles the inline one mostly. 
            // For multiline, ReactMarkdown might wrap "[!NOTE]" in one p, and content in another.
            // If the first child is just "[!NOTE]" (or similar), we hide it and show the rest.
            
            return (
              <div className={cn("mb-4 rounded-md border-l-4 p-4", styles[alertType])}>
                <div className="flex items-center gap-2 font-semibold mb-1">
                   {icons[alertType]}
                   {titles[alertType]}
                </div>
                <div className="text-sm opacity-90">
                    {alertContent}
                </div>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
