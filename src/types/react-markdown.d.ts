import { ReactNode } from 'react'

declare module 'react-markdown' {
  export interface CodeProps {
    node?: any;
    inline?: boolean;
    className?: string;
    children: ReactNode;
  }

  export interface Components {
    code: (props: CodeProps) => ReactNode;
  }

  export interface ReactMarkdownProps {
    children: string;
    components?: Partial<Components>;
  }

  export default function ReactMarkdown(props: ReactMarkdownProps): JSX.Element;
}

