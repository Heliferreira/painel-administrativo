import { NextResponse } from 'next/server'
import { PrismaClient, StatusAssinatura, Formapagamento } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // O Asaas envia os eventos quando o pagamento cai
    if (body.event === 'PAYMENT_RECEIVED' || body.event === 'PAYMENT_CONFIRMED') {
      const payment = body.payment
      const customer = payment.customer // Pode ser um ID ou objeto com dados do cliente

      // Mapeamento da forma de pagamento do Asaas para o Enum do Prisma
      let formaPagamento: Formapagamento = Formapagamento.PIX
      if (payment.billingType === 'CREDIT_CARD') {
        formaPagamento = Formapagamento.CARTAO_CREDITO
      }

      // 1. Criar ou atualizar o Paciente no banco
      const paciente = await prisma.paciente.upsert({
        where: { 
          email: customer.email || `${payment.id}@asaas.com` 
        },
        update: {
          status: StatusAssinatura.EM_DIA,
          asaasCustomerId: typeof customer === 'string' ? customer : customer.id,
          asaasSubscriptionId: payment.subscription || null,
        },
        create: {
          nomeCompleto: customer.name || 'Cliente Asaas',
          cpf: customer.cpfCnpj || '000.000.000-00',
          dataNascimento: new Date(), // Ajustar se a LP recolher a data
          whatsapp: customer.phone || customer.mobilePhone || '',
          email: customer.email || `${payment.id}@asaas.com`,
          valorPlano: payment.value,
          status: StatusAssinatura.EM_DIA,
          formaPagamento: formaPagamento,
          asaasCustomerId: typeof customer === 'string' ? customer : customer.id,
          asaasSubscriptionId: payment.subscription || null,
        },
      })

      // 2. Registar a Transação associada
      await prisma.transacao.create({
        data: {
          pacienteId: paciente.id,
          valor: payment.value,
          status: 'PAGO',
          vencimento: payment.dueDate ? new Date(payment.dueDate) : new Date(),
          dataPagamento: payment.confirmedDate ? new Date(payment.confirmedDate) : new Date(),
          asaasPaymentId: payment.id,
        },
      })

      return NextResponse.json({ status: 'Sucesso', pacienteId: paciente.id })
    }

    return NextResponse.json({ status: 'Evento ignorado' })
  } catch (error) {
    console.error('Erro no webhook do Asaas:', error)
    return NextResponse.json({ error: 'Erro interno ao processar webhook' }, { status: 500 })
  }
}