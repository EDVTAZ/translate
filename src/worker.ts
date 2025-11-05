import {
  pipeline,
  TranslationPipeline,
  type ProgressCallback,
} from "@huggingface/transformers";
import { iso6393To1 } from "iso-639-3";

class MyTranslationPipeline {
  static instance: Promise<TranslationPipeline> | null = null;

  static async getInstance(progress_callback: undefined | ProgressCallback) {
    if (this.instance === null) {
      this.instance = pipeline<"translation">(
        "translation",
        "Xenova/nllb-200-distilled-600M",
        { progress_callback }
      );
    }

    return this.instance;
  }
}

MyTranslationPipeline.getInstance((m) => {
  self.postMessage(m);
});

self.addEventListener("message", async (event) => {
  const translator = await MyTranslationPipeline.getInstance((m) => {
    self.postMessage(m);
  });

  const floresto = event.data.tgt_lang;
  const floresfrom = event.data.src_lang;
  const to = iso6393To1[floresto.slice(0, 3)];
  const from = iso6393To1[floresfrom.slice(0, 3)];

  const output = await translator(event.data.text, {
    //@ts-expect-error
    tgt_lang: floresto,
    src_lang: floresfrom,

    callback_function: (x: any) => {
      self.postMessage({
        status: "update",
        translation: translator.tokenizer.decode(x[0].output_token_ids, {
          skip_special_tokens: true,
        }),
        to,
        from,
      });
    },
  });

  self.postMessage({
    status: "translated",
    // @ts-expect-error
    translation: output[0]["translation_text"],
    to,
    from,
  });
});
