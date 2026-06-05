# This file will include arrays of all the enums for the system

ASSOCIATIONS = ['dotin employee',
                'dotin associate',
                'data science competetions',
                'related company',
                'bachelor student',
                "master's student",
                'phd student']

DOTIN_ASSOCIATIONS = ['dotin employee',
                      'dotin associate',
                      'data science competitions']

RESERVATION_TYPES = ['only running programs',
                     'dorsan desk',
                     'internship',
                     'project']

SYSTEM_ONLY_RESERVATION_TYPES = ['only running programs',
                                 'dorsan desk']

SEAT_TYPES = ['manager',
              'dotin',
              'optimization',
              'laptop']

SEAT_COUNTS = {'manager' : 1,
               'dotin' : 4,
               'optimization' : 2,
               'laptop' : 3}

RESERVATION_STATUS = ['active',
                      'cancelled',
                      'over']

EVENT_STATUS = ['active',
                'cancelled',
                'over']

TIME_SLOT_STATUS = ['free',
                    'event',
                    'reserved_by_user',
                    'reserved_by_others']