
class PlaywrightTestError(Exception):
    """기본 Playwright 테스트 예외"""
    pass


class ElementNotFoundError(PlaywrightTestError):
    """요소를 찾지 못했을 때 발생"""
    def __init__(self, selector, message=None):
        if message is None:
            message = f"요소를 찾을 수 없습니다: {selector}"
        super().__init__(message)
        self.selector = selector


class TimeoutError(PlaywrightTestError):
    """요소 로딩 시간 초과"""
    def __init__(self, selector, timeout, message=None):
        if message is None:
            message = f"{timeout}ms 내에 요소를 찾지 못했습니다: {selector}"
        super().__init__(message)
        self.selector = selector
        self.timeout = timeout


class PageNavigationError(PlaywrightTestError):
    """페이지 이동 실패 예외"""
    def __init__(self, url, message=None):
        if message is None:
            message = f"페이지 이동 실패: {url}"
        super().__init__(message)
        self.url = url


class AssertionFailedError(PlaywrightTestError):
    """테스트 중 assertion 실패를 명확하게 구분"""
    def __init__(self, message="검증 실패"):
        super().__init__(message)