from langchain_community.document_loaders import PyPDFLoader
import pprint

file_path = "../data/sample.pdf"
loader = PyPDFLoader(file_path)

docs = loader.load()
pprint.pp(docs[0].metadata)

pages = []
for doc in loader.lazy_load():
    pages.append(doc)
    if len(pages) >= 10:
        pages = []

# print("Len pages : ", pages)

# chunks = pages[0].page_content[:100]
# print(chunks)
print(type(pages))
print(pages[1])