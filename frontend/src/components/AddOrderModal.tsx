import { useState } from "react";
import {
  Box,
  Button,
  Input,
  Stack,
  Dialog,
  Portal,
  Flex,
  Separator,
  Heading,
  Checkbox,
  NativeSelect,
  InputGroup,
  NumberInput,
} from "@chakra-ui/react";

interface Props {
  onCreate: (order: any) => void;
}

export const AddOrderModal = ({ onCreate }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const [customer, setCustomer] = useState({ name: "", phone: "" });
  const [address, setAddress] = useState({
    street: "",
    number: "",
    neighborhood: "",
    ref: "",
  });
  const [items, setItems] = useState([{ name: "", quantity: 1, price: 0 }]);
  const [payment, setPayment] = useState({
    origin: "CREDIT_CARD",
    prepaid: true,
  });

  const addItem = () =>
    setItems([...items, { name: "", quantity: 1, price: 0 }]);

  const handleSubmit = () => {
    const totalPrice = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
    const orderId = crypto.randomUUID();

    const fullOrder = {
      order_id: orderId,
      store_id: "COCO-BAMBU-01",
      order: {
        order_id: orderId,
        total_price: totalPrice,
        last_status_name: "RECEIVED",
        customer: { name: customer.name, temporary_phone: customer.phone },
        items: items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          total_price: i.price * i.quantity,
        })),
        delivery_address: {
          street_name: address.street,
          street_number: address.number,
          neighborhood: address.neighborhood,
          reference: address.ref,
          city: "Brasília",
        },
        payments: [
          {
            origin: payment.origin,
            prepaid: payment.prepaid,
            value: totalPrice,
          },
        ],
        statuses: [
          { name: "RECEIVED", created_at: Date.now(), origin: "STORE" },
        ],
      },
    };

    onCreate(fullOrder);
    setIsOpen(false);
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(e) => setIsOpen(e.open)}
      scrollBehavior="inside"
    >
      <Dialog.Trigger asChild>
        <Button
          bg="yellow.600"
          color="white"
          size="sm"
          borderRadius="full"
          px="6"
        >
          + Novo Pedido
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" />
        <Dialog.Positioner>
          <Dialog.Content
            bg="white"
            color="gray.800"
            maxW="600px"
            borderRadius="xl"
          >
            <Dialog.Header borderBottomWidth="1px" pb="4">
              <Dialog.Title>Novo Pedido Delivery</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body py="6">
              <Stack gap="6">
                {/* CLIENTE */}
                <Box>
                  <Heading
                    size="xs"
                    textTransform="uppercase"
                    color="orange.500"
                    mb="3"
                  >
                    Cliente
                  </Heading>
                  <Flex gap="3">
                    <InputGroup flex="2" bg="white">
                      <Input
                        value={customer.name}
                        placeholder="Nome completo"
                        onChange={(e) =>
                          setCustomer({ ...customer, name: e.target.value })
                        }
                      />
                    </InputGroup>
                    <InputGroup flex="1" bg="white">
                      <Input
                        value={customer.phone}
                        onChange={(e) =>
                          setCustomer({ ...customer, phone: e.target.value })
                        }
                        placeholder="Telefone"
                      />
                    </InputGroup>
                  </Flex>
                </Box>

                <Separator />

                {/* ITENS */}
                <Box>
                  <Flex justify="space-between" align="center" mb="3">
                    <Heading
                      size="xs"
                      textTransform="uppercase"
                      color="orange.500"
                    >
                      Itens do Pedido
                    </Heading>
                    <Button
                      size="xs"
                      variant="ghost"
                      colorPalette="orange"
                      onClick={addItem}
                    >
                      + Item
                    </Button>
                  </Flex>
                  <Stack gap="2">
                    {items.map((item, idx) => (
                      <Flex key={idx} gap="2">
                        <InputGroup flex="3">
                          <Input
                            size="sm"
                            value={item.name}
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[idx].name = e.target.value;
                              setItems(newItems);
                            }}
                            placeholder="Nome do prato"
                          />
                        </InputGroup>

                        <NumberInput.Root
                          w="80px"
                          value={String(item.quantity ?? 0)}
                          min={0}
                          onValueChange={(details) => {
                            const newItems = [...items];
                            newItems[idx].quantity = details.valueAsNumber ?? 0;
                            setItems(newItems);
                          }}
                        >
                          <NumberInput.Control />
                          <NumberInput.Input />
                        </NumberInput.Root>

                        <NumberInput.Root
                          w="120px"
                          value={String(item.price)}
                          onValueChange={(details) => {
                            const newItems = [...items];
                            newItems[idx].price = details.valueAsNumber ?? 0;
                            setItems(newItems);
                          }}
                          formatOptions={{
                            style: "currency",
                            currency: "BRL",
                            currencyDisplay: "code",
                            currencySign: "accounting",
                          }}
                        >
                          <NumberInput.Control />
                          <NumberInput.Input />
                        </NumberInput.Root>
                      </Flex>
                    ))}
                  </Stack>
                </Box>

                <Separator />

                {/* ENDEREÇO */}
                <Box>
                  <Heading
                    size="xs"
                    textTransform="uppercase"
                    color="orange.500"
                    mb="3"
                  >
                    Entrega
                  </Heading>
                  <Stack gap="2">
                    <Flex gap="2">
                      <Input
                        flex="3"
                        placeholder="Rua/Avenida"
                        value={address.street}
                        onChange={(e) =>
                          setAddress({ ...address, street: e.target.value })
                        }
                      />
                      <Input
                        flex="1"
                        placeholder="Nº"
                        value={address.number}
                        onChange={(e) =>
                          setAddress({ ...address, number: e.target.value })
                        }
                      />
                    </Flex>
                    <Input
                      placeholder="Bairro"
                      value={address.neighborhood}
                      onChange={(e) =>
                        setAddress({ ...address, neighborhood: e.target.value })
                      }
                    />
                    <Input
                      placeholder="Ponto de referência"
                      value={address.ref}
                      onChange={(e) =>
                        setAddress({ ...address, ref: e.target.value })
                      }
                    />
                  </Stack>
                </Box>

                <Separator />

                {/*PAGAMENTO */}
                <Box>
                  <Heading
                    size="xs"
                    textTransform="uppercase"
                    color="orange.500"
                    mb="3"
                  >
                    Pagamento
                  </Heading>
                  <Flex align="center" gap="4">
                    <NativeSelect.Root
                      style={{
                        padding: "8px",
                        borderRadius: "4px",
                        border: "1px solid #E2E8F0",
                        flex: 1,
                      }}
                    >
                      <NativeSelect.Field
                        value={payment.origin}
                        onChange={(e) =>
                          setPayment({
                            ...payment,
                            origin: e.currentTarget.value,
                          })
                        }
                        bg="white"
                      >
                        <option
                          value="CREDIT_CARD"
                          style={{ backgroundColor: "white" }}
                        >
                          Cartão de Crédito
                        </option>
                        <option
                          value="DEBIT_CARD"
                          style={{ backgroundColor: "white" }}
                        >
                          Cartão de Débito
                        </option>
                        <option
                          value="PIX"
                          style={{ backgroundColor: "white" }}
                        >
                          Pix
                        </option>
                        <option
                          value="CASH"
                          style={{ backgroundColor: "white" }}
                        >
                          Dinheiro
                        </option>
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                    <Checkbox.Root
                      colorPalette="orange"
                      checked={payment.prepaid}
                      onChange={(e: any) =>
                        setPayment({ ...payment, prepaid: e.target.checked })
                      }
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                      <Checkbox.Label>Já está pago?</Checkbox.Label>
                    </Checkbox.Root>
                  </Flex>
                </Box>
              </Stack>
            </Dialog.Body>

            <Dialog.Footer borderTopWidth="1px" pt="4">
              <Dialog.ActionTrigger asChild>
                <Button
                  variant="outline"
                  color="gray.800"
                  _hover={{ color: "white" }}
                >
                  Cancelar
                </Button>
              </Dialog.ActionTrigger>
              <Button
                bg="orange.600"
                color="white"
                onClick={handleSubmit}
                px="8"
              >
                Criar Pedido
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
