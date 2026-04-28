from database import get_db_session
from backend.models.seats import Seat

class SeatService:

    @staticmethod
    def get_all_seats():
        """Returns all the seats in the database as a list of Seat objects"""
        session = get_db_session()
        seats = session.query(Seat).all()
        session.close()
        return seats

    @staticmethod
    def get_reservable_seats():
        """
        Returns a list of all the Seat objects that are reservable(Everythig other than the
        Manager Seat).

        :return: A `list` of all the reservable seat objects in the database
        """
        
        with get_db_session() as session:
            reservable_seats = session.query(Seat).filter(Seat.is_reservable==True).all()

        return reservable_seats

    @staticmethod
    def get_seat_by_id(seat_id):
        """
        Returns a Seat class object that has been identified by its ID.
        
        :param seat_id: The id of the seat that we want.
        :return: Seat object if found and `None` otherwise
        """
        with get_db_session() as session:
            seat = session.query(Seat).filter(Seat.id==seat_id).first()

        # if the seat does not exist in the database return nothing.
        if not seat:
            return None

        return seat