function novoElemento(tag_name, class_name) {
    const element = document.createElement(tag_name)
    element.className = class_name

    return element
}

function Barreira(reversa = false) {
    this.elemento = novoElemento('div', 'barreira')

    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')
    this.elemento.appendChild(reversa ? corpo: borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`
}

function ParDeBarreiras(altura, abertura, x) {
    this.elemento = novoElemento('div', 'par-de-barreiras')

    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => {
        const altura_superior = Math.random() * (altura - abertura)
        const altura_inferior = altura - abertura - altura_superior
        this.superior.setAltura(altura_superior)
        this.inferior.setAltura(altura_inferior)
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(x)
}

// const par_de_barreiras = new ParDeBarreiras(450, 100, 400)
// document.querySelector('[wm-flappy]').appendChild(par_de_barreiras.elemento)

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    // Quantidade de pixels percorridos durante cada iteração da animação
    const deslocamento = 3

    this.animar = () => {
        this.pares.forEach( par => {
            par.setX(par.getX() - deslocamento)

            // Quando o elemento sair da área do jogo (tela)
            if(par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            const meio = largura/2
            const cruzou_o_meio = par.getX() + deslocamento >= meio
                && par.getX() < meio

            cruzou_o_meio && notificarPonto()
        })
    }
}

function Passaro(altura_jogo) {
    let voando = false

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    this.animar = () => {
        const novo_y = this.getY() + (voando ? 8 : -5)
        const max_altura = altura_jogo - this.elemento.clientHeight

        if(novo_y < 0) {
            this.setY(0)
        } else if (novo_y > max_altura) {
            this.setY(max_altura)
        } else {
            this.setY(novo_y)
        }
    }

    this.setY(altura_jogo / 2)
}

function Progresso() {
    this.elemento = novoElemento('span', 'progresso')

    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}   

function estaoSobrepostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top
    return horizontal && vertical
}

function Colidiu(passaro, barreiras) {
    let colidiu = false 

    barreiras.pares.forEach( par => {
        if(!colidiu) {
            const superior = par.superior.elemento
            const inferior = par.inferior.elemento

            colidiu = estaoSobrepostos(passaro.elemento, superior) ||
                estaoSobrepostos(passaro.elemento, inferior)
        }
    })

    return colidiu
}

function FlappyBird() {
    let pontos = 0

    const area_do_jogo = document.querySelector('[wm-flappy]')
    const altura_tela = area_do_jogo.clientHeight
    const largura_tela = area_do_jogo.clientWidth

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura_tela, largura_tela, 200, 400, 
        () => progresso.atualizarPontos(++pontos))
    const passaro = new Passaro(altura_tela)

    area_do_jogo.appendChild(progresso.elemento)
    area_do_jogo.appendChild(passaro.elemento)
    barreiras.pares.forEach( par => {
        area_do_jogo.appendChild(par.elemento)
    })

    this.start = () => {
        // loop do jogo
        const temporizador = setInterval( () => {
            passaro.animar()
            barreiras.animar()
            
            if(Colidiu(passaro, barreiras)) {
                clearInterval(temporizador)
            }
        }, 20)
    }
}

new FlappyBird().start()