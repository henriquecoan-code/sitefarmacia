# Modelo de Dados do Produto

Este documento descreve a estrutura de dados para os produtos da farmácia.

## Campos do Produto:

-   **nome**: `String`
    -   Descrição: Nome do produto.
    -   Obrigatório: Sim

-   **descricao**: `String`
    -   Descrição: Descrição detalhada do produto.
    -   Obrigatório: Sim

-   **precoMaximo**: `Number`
    -   Descrição: Preço máximo de venda do produto.
    -   Obrigatório: Sim
    -   Validação: Deve ser um número positivo.

-   **desconto**: `Number`
    -   Descrição: Percentual de desconto a ser aplicado sobre o `precoMaximo`. Armazenado como um valor decimal (ex: 0.1 para 10%, 0.05 para 5%).
    -   Obrigatório: Sim (pode ser 0 se não houver desconto)
    -   Validação: Deve ser um número entre 0 e 1 (inclusive).

-   **valorComDesconto**: `Number`
    -   Descrição: Preço final do produto após a aplicação do desconto. Este campo será calculado automaticamente pelo backend.
    -   Cálculo: `precoMaximo * (1 - desconto)`
    -   Obrigatório: Não (será gerado pelo sistema)

-   **quantidade**: `Number`
    -   Descrição: Quantidade do produto em estoque.
    -   Obrigatório: Sim
    -   Validação: Deve ser um número inteiro não negativo (>= 0).

-   **tags**: `Array<String>`
    -   Descrição: Lista de palavras-chave ou categorias associadas ao produto.
    -   Obrigatório: Não (pode ser uma lista vazia)

-   **fotos**: `Array<String>`
    -   Descrição: Lista de caminhos para as imagens do produto. Inicialmente, serão caminhos de arquivos locais. Futuramente, podem ser URLs do Firebase Storage ou outro serviço de armazenamento.
    -   Obrigatório: Não (pode ser uma lista vazia)

## Exemplo de Documento no Firebase (JSON):

```json
{
  "nome": "Dipirona Monoidratada 500mg",
  "descricao": "Analgésico e antitérmico. Caixa com 10 comprimidos.",
  "precoMaximo": 15.90,
  "desconto": 0.10, // 10% de desconto
  "valorComDesconto": 14.31, // Calculado: 15.90 * (1 - 0.10)
  "quantidade": 100,
  "tags": ["analgésico", "antitérmico", "dor de cabeça", "febre"],
  "fotos": ["/caminho/local/dipirona_frente.jpg", "/caminho/local/dipirona_verso.jpg"]
}
```

