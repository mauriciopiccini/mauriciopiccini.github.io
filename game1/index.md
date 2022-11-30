Montar a partir de UMLStates:

```plantuml

[*] --> Início

Início --> Frente_de_casa
Frente_de_casa --> Shopping
Frente_de_casa --> Baile

state Frente_de_casa {
	J -> L
}
Frente_de_casa: preparação para a aventura

state Shopping {
	Dinheiro -> Vendedor	
}
Shopping: lugar para comprar e vender coisas

state Baile {
	Princesa -> Príncipe
}
Baile: muita coisa aconteceu aqui?

```
