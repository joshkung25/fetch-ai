"""DocsAI v2 retrieval. See docs/v2-architecture.md.

  taxonomy, schemas, config, store   shared by both sides
  ingest/                            upload time: label + store documents
  query/                             chat time: parse -> route -> strategy -> context
  rankers/                           ranking models (plug-in point for BM25F / hybrid)
"""
