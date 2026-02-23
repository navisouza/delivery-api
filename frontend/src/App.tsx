import React from "react";
import { Box, Center, Container, Flex, Spinner, Text } from "@chakra-ui/react";
import { OrderCard } from "./components/OrderCard";
import { Order, StatusName } from "./types";
import { useOrders } from "./hooks/useOrders";
import { AddOrderModal } from "./components/AddOrderModal";

function App() {
  const { orders, loading, updateStatus, createOrder, deleteOrder } =
    useOrders();

  if (loading) {
    return (
      <Center h="100vh" bg="">
        <Flex direction="column" align="center" gap="4">
          <Text
            fontSize="2xl"
            fontWeight="bold"
            color="orange.400"
            letterSpacing="widest"
            textTransform="uppercase"
            fontFamily="Georgia, serif"
          >
            Coco Bambu
          </Text>
          <Text fontSize="sm" color="yellow.600" letterSpacing="wider">
            DELIVERY
          </Text>
          <Spinner size="xl" color="orange.400" borderWidth="3px" />
        </Flex>
      </Center>
    );
  }

  const activeOrders = orders.filter((o) =>
    [StatusName.RECEIVED, StatusName.CONFIRMED, StatusName.DISPATCHED].includes(
      o.order.last_status_name,
    ),
  );
  const closedOrders = orders.filter((o) =>
    [StatusName.DELIVERED, StatusName.CANCELED].includes(
      o.order.last_status_name,
    ),
  );

  return (
    <Box bg="white" minH="100vh" fontFamily="'Georgia', serif">
      <Box
        bg="yellow.subtle"
        borderBottom="1px solid"
        borderColor="yellow.subtle"
        px="8"
        py="4"
        position="sticky"
        top="0"
        zIndex="10"
        backdropFilter="blur(8px)"
      >
        <Flex justify="space-between" align="center" maxW="1400px" mx="auto">
          <Flex align="baseline" gap="3">
            <Text
              fontSize="2xl"
              fontWeight="bold"
              color="yellow.600"
              letterSpacing="widest"
              textTransform="uppercase"
            >
              Coco Bambu
            </Text>
            <Text fontSize="sm" color="yellow.600" letterSpacing="wider">
              DELIVERY
            </Text>
          </Flex>
          <AddOrderModal onCreate={createOrder} />
        </Flex>
      </Box>

      <Container maxW="1400px" px="8" py="10">
        {/* Pedidos ativos */}
        {activeOrders.length > 0 && (
          <Box mb="12">
            <Flex align="center" gap="3" mb="6">
              <Box w="3px" h="20px" bg="yellow.subtle" borderRadius="full" />
              <Text
                fontSize="xs"
                fontWeight="bold"
                color="yellow.600"
                textTransform="uppercase"
                letterSpacing="widest"
              >
                Pedidos em andamento
              </Text>
              <Box flex="1" h="1px" bg="yellow.subtle" />
            </Flex>

            <Flex wrap="wrap" gap="5">
              {activeOrders.map((order: Order) => (
                <OrderCard
                  key={order.order_id}
                  order={order}
                  onUpdateStatus={updateStatus}
                  onDelete={deleteOrder}
                />
              ))}
            </Flex>
          </Box>
        )}

        {/* Pedidos encerrados */}
        {closedOrders.length > 0 && (
          <Box>
            <Flex align="center" gap="3" mb="6">
              <Box w="3px" h="20px" bg="yellow.subtle" borderRadius="full" />
              <Text
                fontSize="xs"
                fontWeight="bold"
                color="yellow.600"
                textTransform="uppercase"
                letterSpacing="widest"
              >
                Encerrados
              </Text>
              <Box flex="1" h="1px" bg="yellow.subtle" />
            </Flex>

            <Flex wrap="wrap" gap="5" opacity={0.9}>
              {closedOrders.map((order: Order) => (
                <OrderCard
                  key={order.order_id}
                  order={order}
                  onUpdateStatus={updateStatus}
                  onDelete={deleteOrder}
                />
              ))}
            </Flex>
          </Box>
        )}

        {orders.length === 0 && (
          <Center h="60vh">
            <Flex direction="column" align="center" gap="3">
              <Text
                color="gray.600"
                letterSpacing="wider"
                textTransform="uppercase"
                fontSize="sm"
              >
                Nenhum pedido encontrado
              </Text>
            </Flex>
          </Center>
        )}
      </Container>
    </Box>
  );
}

export default App;
