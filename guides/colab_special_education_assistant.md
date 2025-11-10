# Google Colab'da Özel Eğitim Sohbet Asistanı Kurulumu

Aşağıdaki hücreleri Google Colab defterinizde sırayla çalıştırarak özel eğitim alanına yönelik bir sohbet asistanını baştan sona hazırlayabilirsiniz. Kod parçaları ayrı hücrelerde çalıştırılmak üzere düzenlenmiştir. Her adımın ne yaptığını açıklayan yorumlar eklenmiştir.

> **Not:** Colab ortamı oturum bazlıdır. Oturumu kapattığınızda yüklediğiniz dosyalar silineceği için Google Drive'a kopya almanız önerilir.

---

## 1. Ortamı Hazırlama ve Gerekli Kütüphaneleri Kurma

```python
# Sistem güncellemeleri ve temel kütüphanelerin kurulumu
!apt-get -qq update
!apt-get -qq install poppler-utils  # PDF okumada kullanılan yardımcı araç

# Python paketlerinin kurulumu
!pip -q install transformers datasets accelerate bitsandbytes sentencepiece
!pip -q install python-docx docx2txt pdfplumber pandas gradio langchain
```

---

## 2. Google Drive'ı Bağlama ve Proje Klasörünü Oluşturma

```python
from google.colab import drive
import os

drive.mount('/content/drive')

# Proje klasörünün yolu
project_root = '/content/drive/MyDrive/ozel_egitim_asistani'
os.makedirs(project_root, exist_ok=True)

print(f"Proje klasörü hazır: {project_root}")
```

Bu hücre Drive'ınızı `/content/drive` dizinine bağlar ve özel eğitim asistanı için kullanacağınız klasörü oluşturur. Tüm veri dosyalarınızı bu klasöre yükleyebilirsiniz.

---

## 3. Veri Dosyalarını Yükleme

Colab arayüzünden "Dosyalar" panelini kullanarak veri dosyalarınızı (`.docx`, `.pdf`, `.xlsx` gibi) az önce oluşturulan klasöre sürükleyip bırakabilirsiniz. Alternatif olarak aşağıdaki kod bloğu ile yerel bilgisayarınızdan yükleme yapabilirsiniz:

```python
from google.colab import files

uploaded = files.upload()  # Birden fazla dosya seçebilirsiniz.

for file_name in uploaded:
    src_path = f'/content/{file_name}'
    dst_path = os.path.join(project_root, file_name)
    os.replace(src_path, dst_path)
    print(f"{file_name} dosyası {dst_path} konumuna taşındı.")
```

Artık `Yapay Zeka İçin Özel Eğitim Veri Seti.docx` ve diğer destekleyici belgeler (PDF, Word, Excel) proje klasörünüzde yer alıyor olmalı.

---

## 4. Belgeleri Metne Dönüştürme

Bu adımda farklı formatlardaki belgeleri temiz bir metin haline getirerek model eğitimine uygun bir veri kümesi oluşturacağız.

```python
import glob
import docx2txt
import pdfplumber
import pandas as pd

project_root = '/content/drive/MyDrive/ozel_egitim_asistani'
raw_texts = []

# DOCX dosyalarını oku
for docx_path in glob.glob(os.path.join(project_root, '*.docx')):
    text = docx2txt.process(docx_path)
    raw_texts.append(text)
    print(f"DOCX okundu: {os.path.basename(docx_path)}")

# PDF dosyalarını oku
for pdf_path in glob.glob(os.path.join(project_root, '*.pdf')):
    with pdfplumber.open(pdf_path) as pdf:
        pages = [page.extract_text() or '' for page in pdf.pages]
    raw_texts.append('\n'.join(pages))
    print(f"PDF okundu: {os.path.basename(pdf_path)}")

# Excel dosyalarını oku
for excel_path in glob.glob(os.path.join(project_root, '*.xlsx')):
    df = pd.read_excel(excel_path)
    text = '\n'.join(df.fillna('').astype(str).agg(' '.join, axis=1))
    raw_texts.append(text)
    print(f"Excel okundu: {os.path.basename(excel_path)}")

# Metin dosyalarını (varsa) oku
for txt_path in glob.glob(os.path.join(project_root, '*.txt')):
    with open(txt_path, 'r', encoding='utf-8') as f:
        raw_texts.append(f.read())
        print(f"TXT okundu: {os.path.basename(txt_path)}")

print(f"Toplam {len(raw_texts)} belge işlendi.")
```

---

## 5. Eğitim İçin Soru-Cevap Çiftleri Hazırlama

Modelin diyalog odaklı öğrenebilmesi için veri kümesini soru-cevap çiftlerine dönüştürmemiz gerekiyor. Aşağıda basit bir şablon yer alıyor; kendi sorularınızı ve cevaplarınızı özel eğitim uzmanlığınıza göre doldurun.

```python
import json
from datasets import Dataset

qa_pairs = [
    {
        "instruction": "Özel eğitimde bireyselleştirilmiş eğitim programı (BEP) nedir?",
        "input": "",
        "output": "BEP, öğrencinin ihtiyaçlarına göre özelleştirilmiş hedefler ve öğretim stratejileri içeren bir plandır."
    },
    {
        "instruction": "Otizm spektrum bozukluğu olan öğrenciler için sınıf düzenlemeleri nasıl yapılmalıdır?",
        "input": "",
        "output": "Duyusal uyaranların azaltılması, görsel desteklerin kullanılması ve rutinlerin korunması önerilir."
    },
]

# Uzmanlığınıza göre qa_pairs listesine yeni örnekler ekleyin.

with open(os.path.join(project_root, 'qa_dataset.json'), 'w', encoding='utf-8') as f:
    json.dump(qa_pairs, f, ensure_ascii=False, indent=2)

train_dataset = Dataset.from_list(qa_pairs)
print(train_dataset)
```

> Eğer belgelerinizden otomatik olarak soru-cevap çıkarmak isterseniz dil modelleri veya metin analiz tekniklerinden yararlanabilirsiniz; ancak en sağlıklı sonuçları manuel olarak doğrulanmış içerikler sağlar.

---

## 6. Tokenizer ve Model Seçimi

Bu örnekte Türkçe'ye uyumlu hafif bir model olan `microsoft/phi-2` yerine Türkçe performansı daha yüksek bir model (`dbmdz/bert-base-turkish-cased` veya `beyonder/llama-turkish`) tercih edebilirsiniz. Diyalog amaçlı olduğu için küçük boyutlu bir `LLaMA` türevi veya `phi-2` benzeri modeller iyi sonuç verebilir.

```python
from transformers import AutoTokenizer, AutoModelForCausalLM

tokenizer_name = "microsoft/phi-2"
model_name = "microsoft/phi-2"

tokenizer = AutoTokenizer.from_pretrained(tokenizer_name, use_fast=True)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    device_map="auto",
    load_in_4bit=True  # Colab GPU belleğini korumak için
)

print("Tokenizer ve model yüklendi.")
```

> Eğer seçtiğiniz model desteklemiyorsa `load_in_4bit` seçeneğini kaldırın.

---

## 7. Veri Kümesini Tokenize Etme

```python
from functools import partial

# Prompt formatını belirleyin
PROMPT_TEMPLATE = """Aşağıdaki soru için uzman bir özel eğitim danışmanı gibi cevap ver.
Soru: {instruction}
Cevap: {output}
"""

def format_example(example):
    return PROMPT_TEMPLATE.format(**example)

formatted_dataset = train_dataset.map(lambda x: {"text": format_example(x)})

# Tokenizasyon
max_length = 512

def tokenize(batch):
    return tokenizer(
        batch["text"],
        truncation=True,
        max_length=max_length,
        padding="max_length"
    )

tokenized_dataset = formatted_dataset.map(tokenize, batched=True, remove_columns=formatted_dataset.column_names)
print(tokenized_dataset)
```

---

## 8. Modeli İnce Ayar (Fine-Tuning) ile Eğitme

```python
from transformers import TrainingArguments, Trainer
import torch

device = "cuda" if torch.cuda.is_available() else "cpu"

training_args = TrainingArguments(
    output_dir=os.path.join(project_root, "model"),
    per_device_train_batch_size=1,
    gradient_accumulation_steps=8,
    num_train_epochs=3,
    learning_rate=2e-4,
    fp16=True,
    logging_steps=10,
    save_strategy="epoch",
    report_to="none"
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset
)

trainer.train()
trainer.save_model()
tokenizer.save_pretrained(os.path.join(project_root, "model"))
```

Eğitim süresi veri setinin boyutuna ve Colab ortamının donanımına göre değişir. Eğitim tamamlandığında model ve tokenizer belirtilen klasöre kaydedilir.

---

## 9. Eğitilen Modelle Sohbet Asistanı Oluşturma

Aşağıdaki Gradio arayüzü, eğitilen modeli kullanarak bir sohbet penceresi açar.

```python
import gradio as gr
import torch

model_path = os.path.join(project_root, "model")
model = AutoModelForCausalLM.from_pretrained(model_path, device_map="auto")
tokenizer = AutoTokenizer.from_pretrained(model_path)

def generate_response(message, history):
    prompt = f"Aşağıdaki soru için uzman bir özel eğitim danışmanı gibi cevap ver.\nSoru: {message}\nCevap:"
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=300,
            temperature=0.7,
            top_p=0.9,
            repetition_penalty=1.1
        )
    answer = tokenizer.decode(outputs[0], skip_special_tokens=True)
    # Yalnızca cevabı ayıkla
    if "Cevap:" in answer:
        answer = answer.split("Cevap:", 1)[-1].strip()
    return answer

chat_interface = gr.ChatInterface(
    fn=generate_response,
    title="Özel Eğitim Sohbet Asistanı",
    description="Özel eğitim konusunda uzman bir yardımcıya sorularınızı yöneltebilirsiniz."
)

chat_interface.launch(share=True)
```

`share=True` parametresi kısa süreliğine erişebileceğiniz bir bağlantı üretir. Tarayıcınızdan bu bağlantıya giderek asistanla sohbet edebilirsiniz.

---

## 10. Modeli Kaydetme ve Yeniden Yükleme

Oturum kapandığında modeli kaybetmemek için Drive üzerinde tuttuğunuz `model` klasörünü daha sonra tekrar kullanabilirsiniz.

```python
# Modeli tekrar yüklemek için
from transformers import AutoTokenizer, AutoModelForCausalLM

model_path = '/content/drive/MyDrive/ozel_egitim_asistani/model'
model = AutoModelForCausalLM.from_pretrained(model_path, device_map="auto")
tokenizer = AutoTokenizer.from_pretrained(model_path)
```

Bu adımlar tamamlandığında, özel eğitim alanındaki sorulara yanıt verebilecek temel bir sohbet asistanı elde etmiş olacaksınız. Veri setinizi genişletip sorularınızı çoğalttıkça modelinizin performansı artacaktır.
