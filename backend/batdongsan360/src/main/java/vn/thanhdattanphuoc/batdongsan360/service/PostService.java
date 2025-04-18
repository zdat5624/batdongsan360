package vn.thanhdattanphuoc.batdongsan360.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import vn.thanhdattanphuoc.batdongsan360.domain.Category;
import vn.thanhdattanphuoc.batdongsan360.domain.District;
import vn.thanhdattanphuoc.batdongsan360.domain.Image;
import vn.thanhdattanphuoc.batdongsan360.domain.Notification;
import vn.thanhdattanphuoc.batdongsan360.domain.Post;
import vn.thanhdattanphuoc.batdongsan360.domain.Province;
import vn.thanhdattanphuoc.batdongsan360.domain.Transaction;
import vn.thanhdattanphuoc.batdongsan360.domain.User;
import vn.thanhdattanphuoc.batdongsan360.domain.Vip;
import vn.thanhdattanphuoc.batdongsan360.domain.Ward;
import vn.thanhdattanphuoc.batdongsan360.repository.CategoryRepository;
import vn.thanhdattanphuoc.batdongsan360.repository.NotificationRepository;
import vn.thanhdattanphuoc.batdongsan360.repository.PostRepository;
import vn.thanhdattanphuoc.batdongsan360.repository.TransactionRepository;
import vn.thanhdattanphuoc.batdongsan360.repository.UserRepository;
import vn.thanhdattanphuoc.batdongsan360.repository.VipRepository;
import vn.thanhdattanphuoc.batdongsan360.repository.address.DistrictRepository;
import vn.thanhdattanphuoc.batdongsan360.repository.address.ImageRepository;
import vn.thanhdattanphuoc.batdongsan360.repository.address.ProvinceRepository;
import vn.thanhdattanphuoc.batdongsan360.repository.address.WardRepository;
import vn.thanhdattanphuoc.batdongsan360.service.specification.PostSpecification;
import vn.thanhdattanphuoc.batdongsan360.util.SecurityUtil;
import vn.thanhdattanphuoc.batdongsan360.util.constant.GenderEnum;
import vn.thanhdattanphuoc.batdongsan360.util.constant.NotificationType;
import vn.thanhdattanphuoc.batdongsan360.util.constant.PostStatusEnum;
import vn.thanhdattanphuoc.batdongsan360.util.constant.PostTypeEnum;
import vn.thanhdattanphuoc.batdongsan360.util.constant.RoleEnum;
import vn.thanhdattanphuoc.batdongsan360.util.constant.TransStatusEnum;
import vn.thanhdattanphuoc.batdongsan360.util.error.IdInvalidException;
import vn.thanhdattanphuoc.batdongsan360.util.response.MapPostDTO;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final VipRepository vipRepository;
    private final ImageRepository imageRepository;
    private final ProvinceRepository provinceRepository;
    private final DistrictRepository districtRepository;
    private final WardRepository wardRepository;
    private final NotificationRepository notificationRepository;
    private final TransactionRepository transactionRepository;
    private final MapboxGeocodeService mapboxGeocodeService;

    public PostService(PostRepository postRepository, UserRepository userRepository,
            CategoryRepository categoryRepository, VipRepository vipRepository, ImageRepository imageRepository,
            ProvinceRepository provinceRepository, DistrictRepository districtRepository, WardRepository wardRepository,
            NotificationRepository notificationRepository, TransactionRepository transactionRepository,
            MapboxGeocodeService mapboxGeocodeService) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.vipRepository = vipRepository;
        this.imageRepository = imageRepository;
        this.provinceRepository = provinceRepository;
        this.districtRepository = districtRepository;
        this.wardRepository = wardRepository;
        this.notificationRepository = notificationRepository;
        this.transactionRepository = transactionRepository;
        this.mapboxGeocodeService = mapboxGeocodeService;
    }

    public Post createPost(Post post, int numberOfDays) throws IdInvalidException {
        // Lấy user hiện tại từ SecurityUtil (giả định đã đăng nhập)
        String userEmail = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new IdInvalidException("Chưa đăng nhập"));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy người dùng"));

        // Tìm category
        Category category = categoryRepository.findById(post.getCategory().getId())
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy danh mục"));

        if (post.getImages() == null || post.getImages().isEmpty()) {
            throw new IdInvalidException("Ảnh không được để trống");
        }

        if (post.getType() != category.getType()) {
            throw new IdInvalidException("Kiểu của bài đăng và kiểu của danh mục không khớp");
        }

        // Xử lý địa chỉ
        if (post.getProvince() != null) {
            Province province = provinceRepository.findById(post.getProvince().getCode())
                    .orElseThrow(() -> new IdInvalidException("Không tìm thấy tỉnh/thành phố"));
            post.setProvince(province);
        }

        if (post.getDistrict() != null) {
            District district = districtRepository.findById(post.getDistrict().getCode())
                    .orElseThrow(() -> new IdInvalidException("Không tìm thấy quận/huyện"));
            if (post.getProvince() != null && !(district.getProvince().getCode() == post.getProvince().getCode())) {
                throw new IdInvalidException("Quận/huyện không thuộc tỉnh/thành phố đã chọn");
            }
            post.setDistrict(district);
        }

        if (post.getWard() != null) {
            Ward ward = wardRepository.findById(post.getWard().getCode())
                    .orElseThrow(() -> new IdInvalidException("Không tìm thấy phường/xã"));
            if (post.getDistrict() != null && !(ward.getDistrict().getCode() == post.getDistrict().getCode())) {
                throw new IdInvalidException("Phường/xã không thuộc quận/huyện đã chọn");
            }
            post.setWard(ward);
        }

        if (post.getDetailAddress() != null && !post.getDetailAddress().isEmpty()) {
            post.setDetailAddress(post.getDetailAddress());
        }

        // Ghép địa chỉ đầy đủ để gửi tới Mapbox
        String fullAddress = post.getDetailAddress() + ", "
                + (post.getWard() != null ? post.getWard().getName() + ", " : "")
                + (post.getDistrict() != null ? post.getDistrict().getName() + ", " : "")
                + (post.getProvince() != null ? post.getProvince().getName() : "");

        // Lấy tọa độ từ Mapbox
        Optional<double[]> latLng = mapboxGeocodeService.getLatLngFromAddress(fullAddress);
        if (latLng.isPresent()) {
            double[] coords = latLng.get();
            post.setLongitude(coords[0]);
            post.setLatitude(coords[1]);
        }

        // Xử lý vip
        Vip vip = new Vip();
        if (post.getVip() != null && post.getVip().getId() > 0) {
            vip = vipRepository.findById(post.getVip().getId())
                    .orElseThrow(() -> new IdInvalidException("Không tìm thấy VIP"));
            post.setVip(vip);
        }

        // Gán thông tin cho bài đăng
        post.setUser(user);
        post.setCategory(category);
        post.setStatus(PostStatusEnum.PENDING);
        post.setCreatedAt(Instant.now());
        post.setExpireDate(post.getCreatedAt().plus(numberOfDays, ChronoUnit.DAYS));

        if (vip.getVipLevel() > 0) {
            post.setStatus(PostStatusEnum.REVIEW_LATER);
            post.setNotifyOnView(true);
        } else {
            post.setNotifyOnView(false);
        }

        // Tính toán chi phí dựa trên số ngày và trừ số dư
        long costPerDay = vip.getPricePerDay();
        long totalCost = numberOfDays * costPerDay;

        if (user.getBalance() < totalCost) {
            throw new IdInvalidException("Số dư không đủ để thực hiện giao dịch");
        }

        user.setBalance((long) (user.getBalance() - totalCost));
        userRepository.save(user);

        // Lưu bài đăng
        post = postRepository.save(post);

        // Luu transaction
        Transaction transaction = new Transaction();
        transaction.setAmount(-totalCost);
        transaction.setDescription("Thanh toán phí đăng tin " + post.getId() + " thành công");
        transaction.setStatus(TransStatusEnum.SUCCESS);
        transaction.setUser(user);
        this.transactionRepository.save(transaction);

        // Xử lý ảnh
        List<Image> images = new ArrayList<>();
        int orderIndex = 0;
        for (Image image : post.getImages()) {
            image.setPost(post);
            image.setOrderIndex(orderIndex++);
            images.add(image);
        }
        imageRepository.saveAll(images);
        post.setImages(images);

        return post;
    }

    public void deletePost(Long postId) throws IdInvalidException {
        // Lấy user hiện tại
        String userEmail = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new IdInvalidException("Chưa đăng nhập"));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy người dùng"));

        // Tìm bài đăng
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy bài đăng"));

        // Kiểm tra quyền sở hữu hoặc quyền admin
        if (!post.getUser().getEmail().equals(userEmail) && !user.getRole().equals(RoleEnum.ADMIN)) {
            throw new IdInvalidException("Bạn không có quyền xóa bài đăng này");
        }

        // Xóa mềm (Soft Delete)
        post.setDeletedByUser(true);
        postRepository.save(post);
    }

    public void deletePostAdmin(Long postId) throws IdInvalidException {
        // Lấy user hiện tại
        String userEmail = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new IdInvalidException("Chưa đăng nhập"));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy người dùng"));

        // Tìm bài đăng
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy bài đăng"));

        // Kiểm tra quyền sở hữu hoặc quyền admin
        if (!post.getUser().getEmail().equals(userEmail) && !user.getRole().equals(RoleEnum.ADMIN)) {
            throw new IdInvalidException("Bạn không có quyền xóa bài đăng này");
        }
        Notification notification = new Notification();
        notification.setUser(post.getUser());
        notification.setRead(false);
        notification.setMessage("Bài đăng " + post.getId() + "của bạn đã bị quản trị viên xóa vĩnh viễn");
        notification.setType(NotificationType.POST);
        notificationRepository.save(notification);

        this.postRepository.delete(post);
    }

    public Post updatePost(Post updatedPost) throws IdInvalidException {
        if (updatedPost.getId() == 0) {
            throw new IdInvalidException("ID của bài đăng không được để trống");
        }

        Post existingPost = postRepository.findById(updatedPost.getId())
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy bài đăng"));

        // Cập nhật các thông tin cơ bản
        if (updatedPost.getTitle() != null) {
            existingPost.setTitle(updatedPost.getTitle());
        }
        if (updatedPost.getDescription() != null) {
            existingPost.setDescription(updatedPost.getDescription());
        }
        if (updatedPost.getPrice() > 0) {
            existingPost.setPrice(updatedPost.getPrice());
        }
        if (updatedPost.getArea() > 0) {
            existingPost.setArea(updatedPost.getArea());
        }
        if (updatedPost.getDetailAddress() != null) {
            existingPost.setDetailAddress(updatedPost.getDetailAddress());
        }

        // Cập nhật danh mục
        if (updatedPost.getCategory() != null && updatedPost.getCategory().getId() > 0) {
            Category category = categoryRepository.findById(updatedPost.getCategory().getId())
                    .orElseThrow(() -> new IdInvalidException("Không tìm thấy danh mục"));
            existingPost.setCategory(category);
        }

        // Cập nhật địa chỉ
        if (updatedPost.getProvince() != null) {
            Province province = provinceRepository.findById(updatedPost.getProvince().getCode())
                    .orElseThrow(() -> new IdInvalidException("Không tìm thấy tỉnh/thành phố"));
            existingPost.setProvince(province);
        }
        if (updatedPost.getDistrict() != null) {
            District district = districtRepository.findById(updatedPost.getDistrict().getCode())
                    .orElseThrow(() -> new IdInvalidException("Không tìm thấy quận/huyện"));
            if (updatedPost.getProvince() != null
                    && !(district.getProvince().getCode() == existingPost.getProvince().getCode())) {
                throw new IdInvalidException("Quận/huyện không thuộc tỉnh/thành phố đã chọn");
            }
            existingPost.setDistrict(district);
        }
        if (updatedPost.getWard() != null) {
            Ward ward = wardRepository.findById(updatedPost.getWard().getCode())
                    .orElseThrow(() -> new IdInvalidException("Không tìm thấy phường/xã"));
            if (updatedPost.getDistrict() != null
                    && !(ward.getDistrict().getCode() == existingPost.getDistrict().getCode())) {
                throw new IdInvalidException("Phường/xã không thuộc quận/huyện đã chọn");
            }
            existingPost.setWard(ward);
        }

        // Cập nhật VIP
        if (updatedPost.getVip() != null && updatedPost.getVip().getId() > 0) {
            Vip vip = vipRepository.findById(updatedPost.getVip().getId())
                    .orElseThrow(() -> new IdInvalidException("Không tìm thấy VIP"));
            existingPost.setVip(vip);
        }

        if (existingPost.getVip() != null && existingPost.getVip().getVipLevel() > 0) {
            existingPost.setNotifyOnView(updatedPost.isNotifyOnView());
        }

        if (updatedPost.getImages() != null && !updatedPost.getImages().isEmpty()) {
            existingPost.getImages().clear();

            List<Image> newImages = new ArrayList<>();
            int orderIndex = 0;
            for (Image img : updatedPost.getImages()) {
                img.setPost(existingPost);
                img.setOrderIndex(orderIndex++);
                newImages.add(img);
            }
            imageRepository.saveAll(newImages);
            existingPost.getImages().addAll(newImages);
        }

        // Cập nhật ngày chỉnh sửa
        existingPost.setUpdatedAt(Instant.now());
        return postRepository.save(existingPost);
    }

    public Post updatePostStatus(Long postId, PostStatusEnum newStatus, String message) throws IdInvalidException {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy bài đăng"));

        // Cập nhật trạng thái
        post.setStatus(newStatus);
        postRepository.save(post);

        // Tạo thông báo cho chủ bài viết
        User postOwner = post.getUser();
        Notification notification = new Notification();
        notification.setRead(false);
        notification.setUser(postOwner);

        if (newStatus.equals(PostStatusEnum.APPROVED)) {
            notification.setType(NotificationType.POST);
            notification.setMessage(message);
        } else if (newStatus.equals(PostStatusEnum.REJECTED)) {
            notification.setType(NotificationType.POST);
            notification.setMessage(message);
        }

        this.notificationRepository.save(notification);
        return post;
    }

    public Post getPostById(Long id) throws IdInvalidException {

        Post post = postRepository.findById(id).orElseThrow(
                () -> new IdInvalidException("Có lỗi xảy ra: không tìm thấy bài đăng id: " + id + ", ..."));

        if (post.isNotifyOnView() && SecurityUtil.getCurrentUserLogin().isPresent()) {

            String userEmail = SecurityUtil.getCurrentUserLogin().get();
            if (userRepository.findByEmail(userEmail).isPresent()) {

                User user = userRepository.findByEmail(userEmail).get();
                if (user.getId() != post.getUser().getId() && !user.getRole().equals(RoleEnum.ADMIN)) {
                    Notification notification = new Notification();
                    if (user.getGender().equals(GenderEnum.FEMALE) || user.getGender().equals(GenderEnum.MALE)
                            || user.getGender().equals(GenderEnum.OTHER)) {

                        notification.setMessage("Người dùng [" + user.getName() + ", phone="
                                + user.getPhone() + ", gender=" + user.getGender() + "] đã xem bài đăng " + post.getId()
                                + " của bạn.");
                    } else {
                        notification.setMessage("Người dùng [" + user.getName() + ", phone="
                                + user.getPhone() + "] đã xem bài đăng " + post.getId()
                                + " của bạn.");
                    }

                    if (!this.notificationRepository.existsByMessage(notification.getMessage())) {
                        notification.setUser(post.getUser());
                        notification.setRead(false);
                        notification.setType(NotificationType.POST);
                        notificationRepository.save(notification);
                    }

                }

            }

        }

        post.setView(post.getView() + 1);
        this.postRepository.save(post);

        return post;
    }

    public Page<Post> getFilteredPosts(Long minPrice, Long maxPrice, Double minArea, Double maxArea,
            PostStatusEnum status, Long provinceCode, Long districtCode, Long wardCode,
            Long categoryId, PostTypeEnum type, Long vipId, Long userId, Boolean isDeleteByUser, int page, int size) {

        Specification<Post> spec = PostSpecification.filterBy(minPrice, maxPrice, minArea, maxArea, status,
                provinceCode, districtCode, wardCode, categoryId, type, vipId, userId, isDeleteByUser);

        Pageable pageable = PageRequest.of(page, size, Sort.by(
                Sort.Order.desc("vip.vipLevel"),
                Sort.Order.desc("createdAt")));
        return postRepository.findAll(spec, pageable);
    }

    public Page<Post> getFilteredReviewOrApprovedPosts(
            Long minPrice, Long maxPrice, Double minArea, Double maxArea,
            Long provinceCode, Long districtCode, Long wardCode, Long categoryId,
            PostTypeEnum type, int page, int size) {

        Specification<Post> spec = PostSpecification.filterBy(
                minPrice, maxPrice, minArea, maxArea, provinceCode, districtCode, wardCode, categoryId,
                type);

        spec = spec.and((root, query, criteriaBuilder) -> root.get("status").in(PostStatusEnum.REVIEW_LATER,
                PostStatusEnum.APPROVED));

        Pageable pageable = PageRequest.of(page, size, Sort.by(
                Sort.Order.desc("vip.vipLevel"),
                Sort.Order.desc("createdAt")));
        return postRepository.findAll(spec, pageable);
    }

    public Page<Post> getMyPosts(Pageable pageable, PostStatusEnum status, PostTypeEnum type,
            Long provinceCode) throws IdInvalidException {
        String userEmail = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new IdInvalidException("Chưa đăng nhập"));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy người dùng"));

        return postRepository.findMyPosts(user.getEmail(), status, type, provinceCode,
                pageable);
    }

    public String getFullAddressByPostId(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with ID: " + postId));

        String detail = post.getDetailAddress() != null ? post.getDetailAddress() : "";
        String ward = post.getWard() != null ? ", " + post.getWard().getName() : "";
        if (detail.equals("")) {
            ward = post.getWard() != null ? post.getWard().getName() : "";
        }
        String district = post.getDistrict() != null ? ", " + post.getDistrict().getName() : "";
        String province = post.getProvince() != null ? ", " + post.getProvince().getName() : "";

        return detail + ward + district + province;
    }

    public List<MapPostDTO> getPostsForMap(Long minPrice, Long maxPrice, Double minArea, Double maxArea,
            Long categoryId, Long provinceCode, Long districtCode, Long wardCode) {
        List<Object[]> results = postRepository.findPostsForMap(minPrice, maxPrice, minArea, maxArea,
                categoryId, provinceCode, districtCode, wardCode);

        List<MapPostDTO> mapPostDTOs = new ArrayList<>();

        for (Object[] result : results) {
            Double latitude = (Double) result[0];
            Double longitude = (Double) result[1];
            Long count = (Long) result[2];
            Long postId = (Long) result[3]; // postId chỉ có giá trị khi count = 1
            Long vipId = (Long) result[4]; // vipId chỉ có giá trị khi count = 1

            if (count > 1) {
                // Nhóm nhiều bài đăng
                mapPostDTOs.add(new MapPostDTO(latitude, longitude, count.intValue()));
            } else if (count == 1 && postId != null && vipId != null) {
                // Bài đăng duy nhất, trả về postId và vipId
                mapPostDTOs.add(new MapPostDTO(latitude, longitude, postId, vipId));
            }
        }

        return mapPostDTOs;
    }

}