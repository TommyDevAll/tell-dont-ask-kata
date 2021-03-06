import OrderRepository from "../repository/OrderRepository";
import OrderApprovalRequest from "./OrderApprovalRequest";
import ApprovedOrderCannotBeRejectedException from "./exceptions/ApprovedOrderCannotBeRejectedException";
import ShippedOrdersCannotBeChangedException from "./exceptions/ShippedOrdersCannotBeChangedException";
import RejectedOrderCannotBeApprovedException from "./exceptions/RejectedOrderCannotBeApprovedException";
import OrderNotDefinedException from "./exceptions/OrderNotDefinedException";
import OrderStatus from "../domain/OrderStatus";

export default class OrderApprovalUseCase {
    private readonly _orderRepository: OrderRepository;

    constructor(orderRepository: OrderRepository) {
        this._orderRepository = orderRepository;
    }

    public run(request: OrderApprovalRequest): void {
        const order = this._orderRepository.getById(request.orderId);

        if (order === undefined) {
            throw new OrderNotDefinedException()
        }

        if (order.status === OrderStatus.SHIPPED) {
            throw new ShippedOrdersCannotBeChangedException();
        }

        if (request.approved && order.status === OrderStatus.REJECTED) {
            throw new RejectedOrderCannotBeApprovedException();
        }

        if (!request.approved && order.status === OrderStatus.APPROVED) {
            throw new ApprovedOrderCannotBeRejectedException();
        }

        order.status = request.approved ? OrderStatus.APPROVED : OrderStatus.REJECTED;
        this._orderRepository.save(order);
    }
}
