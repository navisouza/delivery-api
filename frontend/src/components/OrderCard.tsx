import {
  Box,
  Text,
  Badge,
  Button,
  Stack,
  Flex,
  Separator,
  Dialog,
  HStack,
  Portal,
} from "@chakra-ui/react";
import { Order, StatusName } from "../types";
import { LuTrash2 } from "react-icons/lu";

interface Props {
  order: Order;
  onUpdateStatus: (id: string, status: StatusName) => void;
  onDelete: (id: string) => void;
}

const STATUS_LABEL: Record<string, string> = {
  RECEIVED: "Recebido",
  CONFIRMED: "Confirmado",
  DISPATCHED: "Enviado",
  DELIVERED: "Entregue",
  CANCELED: "Cancelado",
};

const STATUS_COLOR: Record<string, string> = {
  RECEIVED: "blue.600",
  CONFIRMED: "orange.600",
  DISPATCHED: "purple.600",
  DELIVERED: "green.600",
  CANCELED: "red.600",
};

const PAYMENT_LABEL: Record<string, string> = {
  CREDIT_CARD: "Cartão de Crédito",
  DEBIT_CARD: "Cartão de Débito",
  PIX: "Pix",
  CASH: "Dinheiro",
  VR: "Vale Refeição",
};

export const OrderCard = ({ order, onUpdateStatus, onDelete }: Props) => {
  const { order_id, order: details } = order;
  const {
    customer,
    store,
    items,
    payments,
    delivery_address,
    total_price,
    last_status_name: status,
  } = details;
  const payment = payments?.[0];

  const isClosed = ["DELIVERED", "CANCELED"].includes(status);

  return (
    <Box
      width="calc(50% - 12px)"
      borderRadius="xl"
      overflow="hidden"
      borderWidth="1px"
      borderColor="orange.100"
      shadow="md"
      bg="orange.50"
    >
      <Box bg="yellow.subtle" px="5" py="4">
        <Flex justify="space-between" align="flex-start">
          <Stack gap="0">
            <Text fontWeight="bold" color="yellow.600">
              {customer.name}
            </Text>
            <Text fontSize="xs" color="orange.200">
              #{order_id.slice(0, 8)} · {store?.name}
            </Text>
          </Stack>
          <HStack>
            <Badge
              bg={STATUS_COLOR[status]}
              color="white"
              variant="solid"
              borderRadius="xs"
            >
              {STATUS_LABEL[status]}
            </Badge>
            {isClosed && (
              <Dialog.Root role="alertdialog" trapFocus>
                <Dialog.Trigger asChild>
                  <Button
                    variant="ghost"
                    _hover={{ color: "red.200", bg: "transparent" }}
                    color="red.500"
                    size="xs"
                    aria-label="Excluir pedido"
                  >
                    <LuTrash2 />
                  </Button>
                </Dialog.Trigger>
                <Portal>
                  <Dialog.Backdrop bg="blackAlpha.600" />
                  <Dialog.Positioner>
                    <Dialog.Content
                      css={{ background: "white" }}
                      color="gray.900"
                      borderRadius="md"
                      shadow="lg"
                      p="4"
                    >
                      <Dialog.Header>
                        <Dialog.Title>Confirmar Exclusão</Dialog.Title>
                      </Dialog.Header>
                      <Dialog.Body color="gray.700">
                        Tem certeza que deseja remover o pedido de{" "}
                        <strong>{customer.name}</strong>? Esta ação não pode ser
                        desfeita.
                      </Dialog.Body>
                      <Dialog.Footer>
                        <Dialog.ActionTrigger asChild>
                          <Button
                            variant="outline"
                            color="gray.800"
                            _hover={{ bg: "gray.800", color: "white" }}
                          >
                            Cancelar
                          </Button>
                        </Dialog.ActionTrigger>
                        <Button
                          colorPalette="red"
                          onClick={() => onDelete(order_id)}
                        >
                          Excluir
                        </Button>
                      </Dialog.Footer>
                      <Dialog.CloseTrigger />
                    </Dialog.Content>
                  </Dialog.Positioner>
                </Portal>
              </Dialog.Root>
            )}
          </HStack>
        </Flex>
      </Box>

      <Box px="5" py="4">
        {/* Itens */}
        <Text
          fontSize="xs"
          color="gray.400"
          fontWeight="semibold"
          textTransform="uppercase"
          mb="2"
        >
          Itens
        </Text>
        <Stack gap="1" mb="3">
          {items.map((item, index) => (
            <Box key={index}>
              <Flex justify="space-between">
                <Text fontSize="sm" color="gray.700">
                  {item.quantity}x {item.name}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  R$ {item.total_price.toFixed(2)}
                </Text>
              </Flex>
              {item.observations && (
                <Text fontSize="xs" color="orange.500" fontStyle="italic">
                  Obs: {item.observations}
                </Text>
              )}
            </Box>
          ))}
        </Stack>

        <Separator mb="3" />

        {/* Endereço */}
        {delivery_address && (
          <>
            <Text
              fontSize="xs"
              color="gray.400"
              fontWeight="semibold"
              textTransform="uppercase"
              mb="1"
            >
              Entrega
            </Text>
            <Text fontSize="sm" color="gray.700">
              {delivery_address.street_name}, {delivery_address.street_number} ·{" "}
              {delivery_address.neighborhood}
            </Text>
            {delivery_address.reference && (
              <Text fontSize="xs" color="gray.500">
                Ref: {delivery_address.reference}
              </Text>
            )}
            <Separator my="3" />
          </>
        )}

        {/* Pagamento e Total */}
        <Flex justify="space-between" align="center" mb="4">
          <Box>
            <Text
              fontSize="xs"
              color="gray.400"
              fontWeight="semibold"
              textTransform="uppercase"
              mb="1"
            >
              Pagamento
            </Text>
            {payment && (
              <Flex align="center">
                <Badge
                  variant="outline"
                  colorPalette={payment.prepaid ? "green" : "red"}
                  fontSize="xs"
                  borderRadius="xs"
                >
                  {payment.prepaid ? "Pago" : "Cobrar na entrega"} -{" "}
                  {PAYMENT_LABEL[payment.origin] ?? payment.origin}
                </Badge>
              </Flex>
            )}
          </Box>
          <Box textAlign="right">
            <Text fontSize="xs" color="gray.400">
              Total
            </Text>
            <Text fontSize="xl" fontWeight="bold" color="orange.600">
              R$ {total_price.toFixed(2)}
            </Text>
          </Box>
        </Flex>

        {/* Ações */}
        <Flex gap="2">
          {status === "RECEIVED" && (
            <Button
              size="sm"
              bg="orange.600"
              color="white"
              flex="1"
              onClick={() => onUpdateStatus(order_id, StatusName.CONFIRMED)}
            >
              Confirmar
            </Button>
          )}
          {status === "CONFIRMED" && (
            <Button
              size="sm"
              bg="purple.600"
              color="white"
              flex="1"
              onClick={() => onUpdateStatus(order_id, StatusName.DISPATCHED)}
            >
              Enviar
            </Button>
          )}
          {status === "DISPATCHED" && (
            <Button
              size="sm"
              bg="green.600"
              color="white"
              flex="1"
              onClick={() => onUpdateStatus(order_id, StatusName.DELIVERED)}
            >
              Entregar
            </Button>
          )}
          {["RECEIVED", "CONFIRMED", "DISPATCHED"].includes(status) && (
            <Button
              size="sm"
              bg="red.600"
              color="white"
              onClick={() => onUpdateStatus(order_id, StatusName.CANCELED)}
            >
              Cancelar
            </Button>
          )}
        </Flex>
      </Box>
    </Box>
  );
};
