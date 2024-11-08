declare module "@tiptap/extension-emoji" {
  import { Node } from "@tiptap/core";

  export interface EmojiOptions {
    suggestion: any;
    enableEmoticons: boolean;
  }

  export const Emoji: Node<EmojiOptions>;
  export default Emoji;
}
