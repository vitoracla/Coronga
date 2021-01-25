function novoElemento(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function Seringa(reversa = false) {
    this.elemento = novoElemento('div', 'seringa')

    const agulha = novoElemento('div', 'agulha')
    const corpo = novoElemento('div', 'corpo')
    this.elemento.appendChild(reversa ? corpo : agulha)
    this.elemento.appendChild(reversa ? agulha : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`
}

function ParDeSeringas(altura, abertura, x) {
    this.elemento = novoElemento('div', 'par-de-seringas')

    this.superior = new Seringa(true)
    this.inferior = new Seringa(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(x)
}


function Seringas(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new ParDeSeringas(altura, abertura, largura),
        new ParDeSeringas(altura, abertura, largura + espaco),
        new ParDeSeringas(altura, abertura, largura + espaco * 2),
        new ParDeSeringas(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = 3
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            // quando o elemento sair da área do jogo
            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            const meio = largura / 2
            const cruzouOMeio = par.getX() + deslocamento >= meio
                && par.getX() < meio
            if(cruzouOMeio) notificarPonto()
        })
    }
}

function Corona(alturaJogo) {
    let voando = false

    this.elemento = novoElemento('img', 'corona')
    this.elemento.src = 'imgs/corona.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight

        if (novoY <= 0) {
            this.setY(0)
        } else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        } else {
            this.setY(novoY)
        }
    }

    this.setY(alturaJogo / 2)
}

function Progresso() {
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

function estaoSobrepostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect() // pegando o retangulo associado ao elemento a
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top
    return horizontal && vertical
}

function colidiu(corona, seringas) {
    let colidiu = false
    seringas.pares.forEach(pardeSeringas => {
        if (!colidiu) {
            const superior = pardeSeringas.superior.elemento
            const inferior = pardeSeringas.inferior.elemento
            colidiu = estaoSobrepostos(corona.elemento, superior)
                || estaoSobrepostos(corona.elemento, inferior)
        }
    })
    return colidiu
}

function Coronga() {
    let pontos = 0

    const areaDoJogo = document.querySelector('[coronga]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progresso = new Progresso()
    const seringas = new Seringas(500, 1200, 275, 400,
        () => progresso.atualizarPontos(++pontos))
    
    const corona = new Corona(altura)

    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(corona.elemento)
    seringas.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {
        // iniciando o jogo

        const temporizador = setInterval(() => {
            seringas.animar()
            corona.animar()

            if (colidiu(corona, seringas)) {
                clearInterval(temporizador)
            }

        }, 20)
    }
}

new Coronga().start()